import { useState } from "react";
import CitizenPage from "./pages/CitizenPage";
import ResponderPage from "./pages/ResponderPage";

function App() {
  const [userRole, setUserRole] = useState<string>("");
  const [showResponder, setShowResponder] = useState(false);

  // If no role selected, show role selection screen
  if (!userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">Incident Bridge</h1>
          <p className="text-slate-600 text-center mb-6">Emergency Incident Reporting & Response</p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setUserRole("citizen");
                setShowResponder(false);
              }}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              I'm a Citizen - Report an Incident
            </button>
            <button
              onClick={() => {
                setUserRole("responder");
                setShowResponder(true);
              }}
              className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
            >
              I'm a Responder - Manage Incidents
            </button>
          </div>

          <p className="text-xs text-slate-500 text-center mt-6">
            You can switch between roles anytime from the portal
          </p>
        </div>
      </div>
    );
  }
  // Show appropriate page based on role
  if (showResponder || userRole === "responder") {
    return (
      <ResponderPage
        onSwitchToCitizen={() => {
          setShowResponder(false);
          setUserRole("citizen");
        }}
      />
    );
  }

  return (
    <CitizenPage
      onSwitchToResponder={() => {
        setShowResponder(true);
        setUserRole("responder");
      }}
    />
  );
}

export default App;
