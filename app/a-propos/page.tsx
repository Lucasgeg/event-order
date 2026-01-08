import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, User, Coffee, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos - L'histoire derrière le projet",
  description:
    "Découvrez l'histoire de la solution de gestion de commandes, créée par Lucas Gégot, ancien professionnel de la restauration.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Simple */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center group">
              <ArrowLeft className="h-5 w-5 text-gray-500 mr-2 group-hover:text-gray-900 transition-colors" />
              <span className="text-gray-600 group-hover:text-gray-900 font-medium">
                Retour à l&apos;accueil
              </span>
            </Link>
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Logo"
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
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            Du Fournil au Code
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Comment une simple observation dans une boulangerie a mené à la
            création d&apos;une solution digitale complète.
          </p>
        </div>

        {/* L'Histoire */}
        <section className="mb-20">
          <div className="bg-blue-50 rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="bg-white p-4 rounded-full shadow-md text-blue-600 shrink-0">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  L&apos;étincelle
                </h2>
                <div className="prose prose-lg text-gray-600">
                  <p className="mb-4">
                    Tout est parti d&apos;un constat simple chez une amie tenant
                    une boulangerie artisanale. Elle gérait encore ses commandes
                    traiteur et événements sur un <strong>cahier papier</strong>
                    .
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
              <div className="relative w-48 h-48 bg-gray-100 rounded-full overflow-hidden shadow-inner border-4 border-white">
                <Image
                  src="/creatorPicture.jpeg"
                  alt="Lucas Gégot"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Coffee className="h-6 w-6 text-gray-400" />
                Le Créateur
              </h2>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Lucas Gégot
              </h3>
              <p className="text-gray-500 mb-6 font-medium">
                Développeur Web & Ancien Restaurateur
              </p>
              <div className="prose text-gray-600">
                <p className="mb-4">
                  Mon parcours est atypique mais c&apos;est ce qui fait la force
                  de cette application. J&apos;ai passé{" "}
                  <strong>10 ans en restauration</strong>. Je connais la
                  pression du &quot;coup de feu&quot;, l&apos;exigence de
                  qualité et la nécessité absolue d&apos;avoir des outils
                  fiables qui ne nous lâchent pas.
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
        <div className="text-center bg-gray-900 text-white rounded-2xl p-12 shadow-xl">
          <h2 className="text-2xl font-bold mb-4">
            Prêt à moderniser votre activité ?
          </h2>
          <p className="text-gray-300 mb-8 max-w-lg mx-auto">
            Rejoignez-nous et bénéficiez d&apos;un outil pensé par un
            professionnel, pour les professionnels.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-gray-900 bg-white hover:bg-gray-100 transition-colors"
          >
            Commencer gratuitement
          </Link>
        </div>
      </main>
    </div>
  );
}
