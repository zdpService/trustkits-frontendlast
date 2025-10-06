import "./Recharge.css";
import UserInfos from "../utilities/layout pages/UserInfos";
import AccountLayout from "./AccountLayout";
import AffiliationInfo from "../utilities/layout pages/AffiliationInfo";
import PaiementHistory from "../utilities/layout pages/PaiementHistory";
import AchatCredits from "../utilities/layout pages/AchatCredits";

const Recharge = ({ activeSection }) => {
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
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
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
          <AchatCredits />
          <PaiementHistory />
        </div>
      </section>
    </AccountLayout>
  );
};

export default Recharge;
