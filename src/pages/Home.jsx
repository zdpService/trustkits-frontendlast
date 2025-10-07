import "./home.css";
import HeaderLogin from "../components/HeaderLogin";
import SectionHeroLogin from "../components/SectionHeroLogin";
import SectionBannier from "../components/SectionBannier";
import SectionServices from "../components/SectionServices";
import SectionTools from "../components/SectionTools";
import Newsletter from "../components/Newsletter";
import FooterLogin from "../components/FooterLogin";

const Home = () => {
  return (
    <div className="homepageDesign">
      <HeaderLogin />
      <SectionHeroLogin />

      <SectionBannier />
      <SectionServices />
      <SectionTools />
      <Newsletter />
      <FooterLogin />
    </div>
  );
};

export default Home;
