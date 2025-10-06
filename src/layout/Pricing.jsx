import "./Pricing.css";
import UserInfos from "../utilities/layout pages/UserInfos";
import AccountLayout from "./AccountLayout";
import AffiliationInfo from "../utilities/layout pages/AffiliationInfo";
import PaiementHistory from "../utilities/layout pages/PaiementHistory";
import AchatCredits from "../utilities/layout pages/AchatCredits";
import OutilsAccesPayant from "../utilities/layout pages/OutilsAccesPayant";
import OutilsAccesGratuit from "../utilities/layout pages/OutilsAccesGratuit";

const Pricing = ({ activeSection }) => {
  return (
    <AccountLayout>
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.6rem",
            background: "#ffffff",
            padding: "1rem",
          }}
        >
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              style={{
                height: "20px",
                width: "20px",
                color: "#0f172a",
              }}
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          </span>
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{
                height: "20px",
                width: "20px",
                color: "#0f172a",
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{
                  height: "20px",
                  width: "20px",
                  color: "#0f172a",
                  paddingRight: "0.2rem",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 6h.008v.008H6V6Z"
                />
              </svg>
            </span>
            <span
              style={{
                paddingBottom: "0.2rem",
                fontSize: "17px",
                fontFamily: "Righteous",
                fontWeight: "400",
                opacity: "0.8",
              }}
            >
              {activeSection}
            </span>
          </div>
        </div>
        <div className="account_infoItems">
          <OutilsAccesPayant />
          <OutilsAccesGratuit />
        </div>
      </section>
    </AccountLayout>
  );
};

export default Pricing;
