import "./UserInfo.css";
import UserInfos from "../utilities/layout pages/UserInfos";
import AccountLayout from "./AccountLayout";
import AffiliationInfo from "../utilities/layout pages/AffiliationInfo";

const UserInfo = ({ activeSection }) => {
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
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
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
          <UserInfos />
          <AffiliationInfo />
        </div>
      </section>
    </AccountLayout>
  );
};

export default UserInfo;
