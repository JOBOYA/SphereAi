interface MindmapNode {
  id: string;
  type: 'default';
  position: { x: number, y: number };
  data: { label: string, className: string };
}

interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  type: 'smoothstep';
  animated: boolean;
  style: { 
    strokeDasharray: string;
    strokeWidth: number;
  };
}

const formatLabel = (text: string) => {
  return text
    .replace(/[-*:]/g, '')                     // Enlève les caractères spéciaux
    .replace(/Concept|Sous-concept/g, '')      // Enlève les mots "Concept" et "Sous-concept"
    .replace(/\b(le|la|les|du|des|de|un|une)\b/g, '')  // Enlève les articles
    .trim()
    .split(' ')
    .filter(word => word.length > 1)           // Garde uniquement les mots significatifs
    .slice(0, 3)                               // Limite à 3 mots maximum
    .join(' ');
};

export const mindmapService = {
  async generateMindmap(topic: string, accessToken: string) {
    if (!accessToken) {
      throw new Error("Token d'authentification manquant");
    }

    try {
      const response = await fetch('/api/mindmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken.replace('Bearer ', '')}`
        },
        body: JSON.stringify({ 
          prompt: `Crée une mindmap concise sur "${topic}".
                  Format:
                  - ${topic}
                    * Mot clé 1
                    * Mot clé 2
                  - Point 1
                    * Bref 1.1
                    * Bref 1.2
                  - Point 2
                    * Bref 2.1
                    * Bref 2.2
                  [Maximum 4 points, réponses courtes de 1-3 mots maximum]` 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Erreur ${response.status}`);
      }

      const data = await response.json();
      
      // Parser la réponse
      const lines = data.api_response.split('\n')
        .filter((line: string) => line.trim())
        .map((line: string) => line.trim());

      const nodes: MindmapNode[] = [];
      const edges: MindmapEdge[] = [];
      
      const HORIZONTAL_SPACING = 400;  // Espacement horizontal
      const VERTICAL_SPACING = 120;    // Espacement vertical
      const START_X = 50;             // Position de départ
      const START_Y = 300;            // Position centrale

      // Nœud central
      nodes.push({
        id: 'central',
        type: 'default',
        position: { x: START_X, y: START_Y },
        data: { 
          label: topic,
          className: 'central-node'
        }
      });

      let currentMainConcept = '';
      let mainConceptCount = 0;
      let subConceptCount = 0;

      // Calculer la disposition en arbre
      lines.forEach((line: string) => {
        if (line.startsWith('-')) {
          // Concept principal - disposition en arbre
          currentMainConcept = `main-${mainConceptCount}`;
          const label = formatLabel(line);
          
          // Position horizontale progressive
          const x = START_X + ((mainConceptCount + 1) * HORIZONTAL_SPACING);
          // Position verticale alternée pour les concepts principaux
          const y = START_Y;

          nodes.push({
            id: currentMainConcept,
            type: 'default',
            position: { x, y },
            data: { 
              label,
              className: 'main-concept-node'
            }
          });

          // Connexion en chaîne pour les concepts principaux
          edges.push({
            id: `edge-main-${mainConceptCount}`,
            source: mainConceptCount === 0 ? 'central' : `main-${mainConceptCount-1}`,
            target: currentMainConcept,
            type: 'smoothstep',
            animated: true,
            style: { 
              strokeDasharray: '5,5',
              strokeWidth: 1
            }
          });

          mainConceptCount++;
          subConceptCount = 0;
        } else if (line.startsWith('*') && currentMainConcept) {
          // Sous-concepts - disposition verticale
          const label = formatLabel(line);
          const subId = `${currentMainConcept}-sub-${subConceptCount}`;
          
          const mainNodeIndex = nodes.findIndex(n => n.id === currentMainConcept);
          const mainNodePos = nodes[mainNodeIndex].position;

          // Positionner les sous-concepts au-dessus et en-dessous alternativement
          const yOffset = subConceptCount % 2 === 0 
            ? -VERTICAL_SPACING 
            : VERTICAL_SPACING;

          nodes.push({
            id: subId,
            type: 'default',
            position: {
              x: mainNodePos.x,
              y: mainNodePos.y + yOffset
            },
            data: { 
              label,
              className: 'sub-concept-node'
            }
          });

          // Connexion directe au concept principal
          edges.push({
            id: `edge-sub-${mainConceptCount}-${subConceptCount}`,
            source: currentMainConcept,
            target: subId,
            type: 'smoothstep',
            animated: true,
            style: { 
              strokeDasharray: '5,5',
              strokeWidth: 1
            }
          });

          subConceptCount++;
        }
      });

      return { nodes, edges };
    } catch (error) {
      console.error('Erreur service mindmap:', error);
      throw error;
    }
  }
}; 