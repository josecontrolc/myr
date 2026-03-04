import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type DashboardLinkType = "internal" | "external";

interface DashboardLink {
  id: string;
  title: string;
  type: DashboardLinkType;
  to: string;
}

const TicketIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 8.5C5.38 8.5 6.5 7.38 6.5 6 6.5 4.62 5.38 3.5 4 3.5H3.5v17H4c1.38 0 2.5-1.12 2.5-2.5S5.38 15.5 4 15.5" />
    <path d="M20 8.5C18.62 8.5 17.5 7.38 17.5 6 17.5 4.62 18.62 3.5 20 3.5h.5v17H20c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5" />
    <path d="M8.5 6h7" />
    <path d="M8.5 12h7" />
    <path d="M8.5 18h7" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
    <path d="M4 10h16" />
    <circle cx="12" cy="15" r="1.3" />
  </svg>
);

const DocumentIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 3.5h6.5L20 9v11.5H8z" />
    <path d="M14.5 3.5V9H20" />
    <path d="M10.5 13h5" />
    <path d="M10.5 16h3.5" />
  </svg>
);

const EuroIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="7.5" />
    <path d="M9 10h4.5" />
    <path d="M9 14h4" />
    <path d="M11.5 8.3A3.6 3.6 0 0 1 14 9.5" />
    <path d="M11.5 15.7A3.6 3.6 0 0 0 14 14.5" />
  </svg>
);

const UserIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="9" r="3.2" />
    <path d="M6.5 18.5C7.7 16.6 9.7 15.5 12 15.5s4.3 1.1 5.5 3" />
    <circle cx="12" cy="12" r="7.5" />
  </svg>
);

const TagIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4.5 11.5 11.5 4.5l7 7-7 7-7-7z" />
    <circle cx="10.1" cy="9.9" r="1.1" />
  </svg>
);

const BoxIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4.5 8.5 12 4.5l7.5 4v7l-7.5 4-7.5-4z" />
    <path d="M4.5 8.5 12 12.5l7.5-4" />
    <path d="M12 12.5v7.5" />
  </svg>
);

const RoomIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <path d="M10 19V9h4v10" />
    <circle cx="14.5" cy="13" r="0.9" />
  </svg>
);

const ContractIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 3.5h7.5L20 8v12.5H8z" />
    <path d="M15.5 3.5V8H20" />
    <path d="M10 11h5" />
    <path d="M10 14h3.5" />
    <path d="M9 18.5 11 16l2 1.5 2-2.5" />
  </svg>
);

const KycIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="4" y="6" width="16" height="12" rx="2" />
    <circle cx="9" cy="11" r="1.5" />
    <path d="M6.5 15c.5-1.2 1.5-2 2.5-2s2 .8 2.5 2" />
    <path d="M13 10h3" />
    <path d="M13 13h2.5" />
  </svg>
);

const ShieldIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 3.5 6 5.7v6.6c0 3.2 2.4 5.8 6 7.2 3.6-1.4 6-4 6-7.2V5.7z" />
    <path d="M9.5 12.5 11 14l3.5-3.5" />
  </svg>
);

const BookIcon = () => (
  <svg
    className="w-8 h-8 sm:w-9 sm:h-9"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6.5 4.5h8.5A2.5 2.5 0 0 1 17.5 7v12H8A2.5 2.5 0 0 0 5.5 16.5V7A2.5 2.5 0 0 1 8 4.5z" />
    <path d="M7.5 8h6" />
    <path d="M7.5 11h4" />
  </svg>
);

const getIconForLink = (id: DashboardLink["id"]) => {
  switch (id) {
    case "tickets":
      return <TicketIcon />;
    case "interventions":
      return <CalendarIcon />;
    case "facturation":
      return <DocumentIcon />;
    case "sepa":
      return <EuroIcon />;
    case "information-client":
      return <UserIcon />;
    case "offres":
      return <TagIcon />;
    case "commandes":
      return <BoxIcon />;
    case "contrats":
      return <ContractIcon />;
    case "kyc":
      return <KycIcon />;
    case "reservation-salles":
      return <RoomIcon />;
    case "securite":
      return <ShieldIcon />;
    case "ressources":
    case "commande-rapide":
      return <BookIcon />;
    default:
      return <DocumentIcon />;
  }
};

const links: DashboardLink[] = [
  { id: "tickets", title: "Tickets", type: "internal", to: "/tickets" },
  { id: "interventions", title: "Interventions", type: "internal", to: "/interventions" },
  { id: "facturation", title: "Invoices", type: "internal", to: "/facturation" },
  { id: "sepa", title: "SEPA mandate", type: "internal", to: "/domiciliation-sepa" },
  { id: "information-client", title: "Customer information", type: "internal", to: "/information-client" },
  { id: "reservation-salles", title: "BCP room reservations", type: "internal", to: "/reservation-salles-bcp" },
  { id: "offres", title: "Offers", type: "internal", to: "/offres" },
  { id: "commandes", title: "Orders", type: "internal", to: "/commandes" },
  { id: "contrats", title: "Contracts", type: "internal", to: "/contrats" },
  { id: "kyc", title: "KYC", type: "internal", to: "/kyc" },
  { id: "securite", title: "Security", type: "internal", to: "/securite" },
  { id: "ressources", title: "Resources", type: "internal", to: "/ressources" },
];

export const DashboardQuickLinks = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const handleClick = (link: DashboardLink) => {
    if (link.type === "external") {
      window.open(link.to, "_blank", "noopener,noreferrer");
    } else {
      navigate(link.to);
    }
  };

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 justify-items-center">
      {links.map((link) => (
        <button
          key={link.id}
          type="button"
          onClick={() => handleClick(link)}
          className="group relative flex flex-col items-center justify-center rounded-xl px-3 py-5 text-textPrimary dark:text-textPrimary-dark hover:bg-background dark:hover:bg-background-dark transition-all focus:outline-none focus:ring-2 focus:ring-secondary/70 focus:ring-offset-0"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="quick-link-card">
              {getIconForLink(link.id)}
            </div>
            <p className="text-xs sm:text-sm font-medium text-textPrimary dark:text-textPrimary-dark text-center leading-snug whitespace-nowrap mt-1">
              {t(`dashboard.home.links.${link.id}`)}
            </p>
          </div>
        </button>
      ))}
    </section>
  );
};

export default DashboardQuickLinks;

