import "./SectionBannier.css";

const littleSetion = [
  {
    title: "Technologie adaptée",
    description:
      "La chose la plus importante à prendre en compte lorsque vous souhaitez développer votre site Web, votre application ou votre commerce électronique de premier ordre est la technologie, bien sûr ! Nous vous aidons à choisir celle qui correspond le mieux à vos besoins.",
  },
  {
    title: "Approche personnelle & efficace",
    description:
      "Tout d’abord nous apportons une approche personnelle et efficace à chaque projet de création de site internet sur lequel nous travaillons. Nous créons des sites Web évolutifs qui s’adaptent facilement à n’importe quel support.",
  },
  {
    title: "Contact & Devis",
    description: (
      <>
        Contactez-nous par e-mail à l'adresse{" "}
        <strong style={{ fontWeight: "bold", color: "#555" }}>
          contact@trustkits.com
        </strong>{" "}
        pour avoir un devis personnalisé sur l'un de vos projets.
      </>
    ),
  },
];

const SectionBannier = () => {
  return (
    <section className="section_bannier">
      <div>
        <h1
          style={{
            opacity: "0.9",
            padding: "0.5rem 0",
          }}
        >
          Votre site web ou application mobile de rêve vous attend !
        </h1>
        <ul>
          {littleSetion.map((constille, index) => (
            <li key={index}>
              <h3> {constille.title} </h3>
              <p> {constille.description} </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default SectionBannier;
