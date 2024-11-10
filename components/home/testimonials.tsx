import { motion } from "framer-motion";
import Image from "next/image";

export const Testimonials = () => {
  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Directrice Marketing",
      company: "TechVision",
      image: "/testimonials/sophie.jpg",
      text: "Sphere AI a révolutionné notre approche créative. La qualité des générations est impressionnante.",
      rating: 5
    },
    {
      name: "Jean Dupont",
      role: "Directeur Technique",
      company: "InnovLab",
      image: "/testimonials/jean.jpg",
      text: "L'interface est intuitive et les résultats sont au-delà de nos attentes. Un outil indispensable.",
      rating: 5
    },
    {
      name: "Marie Lambert",
      role: "Designer",
      company: "CreateStudio",
      image: "/testimonials/marie.jpg",
      text: "La polyvalence de Sphere AI nous permet d'explorer de nouvelles possibilités créatives chaque jour.",
      rating: 5
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl transform -rotate-1 group-hover:rotate-1 transition-transform" />
          <div className="relative bg-card p-8 rounded-xl shadow-lg backdrop-blur-sm border border-primary/10">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 rounded-full blur-sm" />
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={56}
                  height={56}
                  className="relative rounded-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role} @ {testimonial.company}
                </p>
              </div>
            </div>
            <div className="flex gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <motion.svg
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="w-5 h-5 text-yellow-500 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </motion.svg>
              ))}
            </div>
            <p className="text-muted-foreground italic relative">
              <span className="absolute -top-4 -left-2 text-4xl text-primary/20">"</span>
              {testimonial.text}
              <span className="absolute -bottom-4 -right-2 text-4xl text-primary/20">"</span>
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}; 