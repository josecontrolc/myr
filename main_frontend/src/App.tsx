import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@shared/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InfoPage from "./pages/Dashboard";
import Home from "./pages/Home";
import TwoFactorChallenge from "./pages/TwoFactorChallenge";
import EmailOtpChallenge from "./pages/EmailOtpChallenge";
import Navbar from "./components/Navbar";
import DashboardHome from "./pages/DashboardHome";
import PlaceholderPage from "./pages/PlaceholderPage";
import { ThemeProvider } from "./theme/ThemeProvider";

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-background dark:bg-background-dark text-textPrimary dark:text-textPrimary-dark font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/service-status" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<DashboardHome />} />
                <Route path="/info" element={<InfoPage />} />
                <Route
                  path="/tickets"
                  element={<PlaceholderPage titleKey="pages.tickets.title" />}
                />
                <Route
                  path="/interventions"
                  element={<PlaceholderPage titleKey="pages.interventions.title" />}
                />
                <Route
                  path="/facturation"
                  element={<PlaceholderPage titleKey="pages.billing.title" />}
                />
                <Route
                  path="/domiciliation-sepa"
                  element={<PlaceholderPage titleKey="pages.sepa.title" />}
                />
                <Route
                  path="/information-client"
                  element={<PlaceholderPage titleKey="pages.customerInfo.title" />}
                />
                <Route
                  path="/reservation-salles-bcp"
                  element={<PlaceholderPage titleKey="pages.bcpRooms.title" />}
                />
                <Route
                  path="/offres"
                  element={<PlaceholderPage titleKey="pages.offers.title" />}
                />
                <Route
                  path="/commandes"
                  element={<PlaceholderPage titleKey="pages.orders.title" />}
                />
                <Route
                  path="/contrats"
                  element={<PlaceholderPage titleKey="pages.contracts.title" />}
                />
                <Route
                  path="/kyc"
                  element={<PlaceholderPage titleKey="pages.kyc.title" />}
                />
                <Route
                  path="/securite"
                  element={<PlaceholderPage titleKey="pages.security.title" />}
                />
                <Route
                  path="/ressources"
                  element={<PlaceholderPage titleKey="pages.resources.title" />}
                />
                <Route
                  path="/commande-rapide"
                  element={<PlaceholderPage titleKey="pages.quickOrder.title" />}
                />
                <Route path="/auth/2fa-challenge" element={<TwoFactorChallenge />} />
                <Route path="/auth/email-otp" element={<EmailOtpChallenge />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
