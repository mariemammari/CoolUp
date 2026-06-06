import womenImg from '../assets/women.png';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-semibold text-app_blue italic">
          À <span className="text-app_green">propos</span>
        </h1>
      </div>

      <div className="md:flex md:items-start md:gap-8 mb-8">
        {/* Left: image */}
        <div className="md:w-1/2 flex justify-start mb-6 md:mb-0">
          <img src={womenImg} alt="Membre de l'équipe" className="w-full max-w-sm rounded-lg " />
        </div>

        {/* Right: equipe + notre mission */}
        <div className="md:w-1/2 space-y-6">
          <section className="p-6 rounded-2xl bg-white border border-border shadow-sm">
            <h2 className="text-2xl font-semibold text-app_blue mb-4">L'équipe</h2>
            <p className="text-app_black/80 leading-relaxed">
              CoolUp est un projet étudiant développé dans le cadre d'un stage à Paris.
              L'équipe est composée de développeurs et designers passionnés par l'urbanisme,
              les données ouvertes et le bien-être citoyen. Notre objectif est de rendre
              l'information publique accessible et utile au quotidien.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-white border border-border shadow-sm">
            <h2 className="text-2xl font-semibold text-app_blue mb-4">Notre mission</h2>
            <p className="text-app_black/80 leading-relaxed">
              CoolUp aide les Parisiens à trouver des îlots de fraîcheur pendant les épisodes de forte chaleur.
              Avec le réchauffement climatique, les canicules deviennent plus fréquentes et intenses en ville.
              L'accès à l'eau potable, aux espaces verts ombragés et aux lieux climatisés est essentiel
              pour protéger la santé de tous, en particulier des personnes vulnérables.
            </p>
            <p className="text-app_black/80 leading-relaxed mt-4">
              Notre application centralise ces ressources sur une carte interactive pour que chacun puisse,
              en quelques clics, identifier le spot le plus proche et s'y rendre à pied.
            </p>
          </section>
        </div>
      </div>

      <section className="p-6 rounded-2xl bg-app_surface-2 border border-border">
        <h2 className="text-2xl font-semibold text-app_blue mb-4">Sources de données</h2>
        <p className="text-app_black/80 leading-relaxed mb-4">
          Les informations sur les fontaines, parcs et espaces climatisés proviennent
          des données ouvertes de la Ville de Paris :
        </p>
        <ul className="space-y-2">
          <li>
            <a
              href="https://opendata.paris.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-app_green font-medium hover:text-app_teal underline transition-colors"
            >
              Paris Open Data — opendata.paris.fr
            </a>
          </li>
          <li>
            <a
              href="https://www.openstreetmap.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-app_green font-medium hover:text-app_teal underline transition-colors"
            >
              OpenStreetMap — cartographie & géocodage
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
