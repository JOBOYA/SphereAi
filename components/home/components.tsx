import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { Language } from './translations';

export function LanguageDropdown({ setLanguage }: { setLanguage: (language: Language) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("fr")}>
          Français
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage("es")}>
          Español
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AuthButtons({ t }: { t: Record<string, string> }) {
  return (
    <>
      <SignedIn>
        <Link href="/dashboard" passHref>
          <Button variant="outline">{t.dashboard}</Button>
        </Link>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button variant="outline">{t.getStarted}</Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
