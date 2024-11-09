import { SignIn } from "@clerk/nextjs";
import { useSignUp } from "@clerk/nextjs";
import { FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const { signUp, isLoaded } = useSignUp();
    const router = useRouter();
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!isLoaded) return;

        try {
            // Inscription avec Clerk
            const result = await signUp.create({
                emailAddress: emailRef.current?.value,
                password: passwordRef.current?.value,
            });

            // Obtenir le token de session
            const sessionToken = await result.createdSessionId;
            
            // Une fois l'inscription Clerk réussie, enregistrer dans votre API
            const response = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionToken}`
                },
                body: JSON.stringify({
                    email: emailRef.current?.value,
                    clerkUserId: result.createdUserId,
                    clerk_token: sessionToken
                })
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l\"inscription");
            }

            // Redirection après inscription réussie
            router.push("/dashboard");
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    return (
        <div className="flex justify-center py-24">
            <SignIn signUpUrl="/sign-up" afterSignInUrl="/dashboard" />
        </div>
    );
}
