import "./Affiliation.css";
import UserInfos from "../utilities/layout pages/UserInfos";
import AccountLayout from "./AccountLayout";
import AffiliationInfo from "../utilities/layout pages/AffiliationInfo";
import PaiementHistory from "../utilities/layout pages/PaiementHistory";
import AchatCredits from "../utilities/layout pages/AchatCredits";
import DashboardAffiliation from "../utilities/layout pages/DashboardAffiliation";
import HistoriqueGains from "../utilities/layout pages/HistoriqueGains";

const Affiliation = ({ activeSection }) => {
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
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
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
          <DashboardAffiliation />
          <HistoriqueGains />
        </div>
      </section>
    </AccountLayout>
  );
};

export default Affiliation;
