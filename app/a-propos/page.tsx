import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, Coffee, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos - L'histoire derrière le projet",
  description:
    "Découvrez l'histoire de la solution de gestion de commandes, créée par Lucas Gégot, ancien professionnel de la restauration.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation Simple */}
      <nav className="bg-cream/90 backdrop-blur border-b border-line sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center group">
              <ArrowLeft
                className="h-5 w-5 text-ink-soft mr-2 group-hover:text-ink transition-colors"
                aria-hidden
              />
              <span className="text-ink-soft group-hover:text-ink font-medium transition-colors">
                Retour à l&apos;accueil
              </span>
            </Link>
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Cahier du Chef Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl font-bold text-ink sm:text-5xl mb-4">
            Du Fournil au Code
          </h1>
          <p className="text-xl text-ink-soft max-w-2xl mx-auto leading-relaxed">
            Comment une simple observation dans une boulangerie a mené à la
            création d&apos;une solution digitale complète.
          </p>
        </div>

        {/* L'Histoire */}
        <section className="mb-20">
          <div className="bg-surface border border-line rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="bg-gold-soft p-4 rounded-full text-gold-dark shrink-0">
                <BookOpen className="h-8 w-8" aria-hidden />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-ink mb-4">
                  L&apos;étincelle
                </h2>
                <div className="text-lg text-ink-soft leading-relaxed">
                  <p className="mb-4">
                    Tout est parti d&apos;un constat simple chez une amie tenant
                    une boulangerie artisanale. Elle gérait encore ses commandes
                    traiteur et événements sur un{" "}
                    <strong className="text-ink">cahier papier</strong>.
                  </p>
                  <p className="mb-4">
                    Malgré son savoir-faire exceptionnel, ce système créait des
                    frustrations : ratures, difficultés de relecture, oublis
                    occasionnels dans le rush, et beaucoup de temps perdu à
                    recalculer les totaux de production.
                  </p>
                  <p>
                    Il fallait une solution qui garde la simplicité du papier
                    mais avec la puissance du numérique. C&apos;est ainsi que
                    l&apos;idée est née : moderniser ce processus avec une
                    tablette pour sécuriser et accélérer la prise de commande.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Le Créateur */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-48 h-48 bg-parchment rounded-full overflow-hidden shadow-md ring-4 ring-surface">
                <Image
                  src="/creatorPicture.jpeg"
                  alt="Lucas Gégot"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="font-display text-2xl font-bold text-ink mb-4 flex items-center gap-3">
                <Coffee className="h-6 w-6 text-gold-dark" aria-hidden />
                Le Créateur
              </h2>
              <h3 className="text-xl font-semibold text-ink mb-1">
                Lucas Gégot
              </h3>
              <p className="text-gold-dark mb-6 font-semibold">
                Développeur Web & Ancien Restaurateur
              </p>
              <div className="text-ink-soft leading-relaxed">
                <p className="mb-4">
                  Mon parcours est atypique mais c&apos;est ce qui fait la force
                  de cette application. J&apos;ai passé{" "}
                  <strong className="text-ink">10 ans en restauration</strong>.
                  Je connais la pression du &quot;coup de feu&quot;,
                  l&apos;exigence de qualité et la nécessité absolue
                  d&apos;avoir des outils fiables qui ne nous lâchent pas.
                </p>
                <p>
                  Reconverti dans le développement web par passion, j&apos;ai
                  voulu mettre mes nouvelles compétences techniques au service
                  de mon ancien métier. Je ne code pas seulement une
                  application, je crée l&apos;outil que j&apos;aurais aimé
                  avoir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center bg-primary text-white rounded-2xl p-12 shadow-xl">
          <h2 className="font-display text-2xl font-bold mb-4">
            Prêt à moderniser votre activité ?
          </h2>
          <p className="text-gold-soft/90 mb-8 max-w-lg mx-auto leading-relaxed">
            Rejoignez-nous et bénéficiez d&apos;un outil pensé par un
            professionnel, pour les professionnels.
          </p>
          <Link
            href="/inscription"
            className="inline-flex items-center h-12 px-6 rounded-lg text-base font-semibold text-primary bg-white hover:bg-gold-soft transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>
      </main>
    </div>
  );
}
