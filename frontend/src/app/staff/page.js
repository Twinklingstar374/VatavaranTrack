"use client";

import { useState, useEffect, useCallback } from "react";
// Removed 'next/router' import to resolve compilation error.
// We will use window.location.href for basic navigation.

// CO2 factors per category (kg CO₂ per kg waste)
const CO2_FACTORS = { plastic: 1.7, green: 0.3, dry: 0.5 };

// Badge thresholds (total kg CO₂ saved)
const BADGE_THRESHOLDS = [10, 50, 100];

// Simple Message Box Component
const MessageBox = ({ message, onClose }) => {
    if (!message) return null;
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
                <p className="text-gray-800 font-semibold mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                    Close
                </button>
            </div>
        </div>
    );
};


export default function StaffDashboard() {
  const [user, setUser] = useState(null); // User Name
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Waste Submission States
  const [category, setCategory] = useState("plastic");
  const [weight, setWeight] = useState("");
  const [location, setLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(''); // Custom message box content

  // Pickup/Achievement States
  const [co2Saved, setCo2Saved] = useState(0); // This should ideally be fetched from DB
  const [badges, setBadges] = useState([]);
  const [pickups, setPickups] = useState([]); 
  // const [offlineQueue, setOfflineQueue] = useState([]); // Leaving offline queue out for "simple" version

  // Function to handle navigation without useRouter
  const navigateTo = (path) => {
    window.location.href = path.startsWith('/') ? path : `/${path}`;
  };

  // 1. Authentication and User Data Loading
  useEffect(() => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  console.log("token", token);
  console.log("userRole", userRole);
  console.log("userName", userName);

  if (!token || !userRole || !userName) {
    console.log("No auth token/role found, redirecting to login.");
    navigateTo("/login");
    return;
  }

  setUser(userName);
  setRole(userRole);
  setLoading(false);
}, []);

  // 2. Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigateTo("/login");
  };

  // Handle message box close
  const handleMessageClose = () => {
      setMessage('');
  };


  // 3. Location and Image Handlers
  const handleLocation = () => {
      if (!navigator.geolocation) return setMessage("Geolocation not supported by your browser.");
      
      setMessage("Fetching location...");

      navigator.geolocation.getCurrentPosition(pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setMessage(`Location captured: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
      }, (error) => {
        console.error("Geolocation error:", error);
        setMessage("Unable to fetch location. Please ensure location services are enabled.");
      }, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
      });
  };

  const handleImage = e => {
      if (e.target.files.length > 0) setImage(e.target.files[0]);
  };


  // 4. Submit Pickup Handler (Currently Mocked)
  const handleSubmitPickup = async () => {
      if (isSubmitting) return;
      
      const numericWeight = parseFloat(weight);
      
      if (!weight || numericWeight <= 0) return setMessage("Enter a valid positive weight.");
      if (!location) return setMessage("Capture location first.");

      setIsSubmitting(true);
      setMessage('');

      const co2 = numericWeight * CO2_FACTORS[category];

      // --- MOCK API CALL (Placeholder for real axios/fetch) ---
      try {
          // --- 1. SIMULATE NETWORK LATENCY ---
          // NOTE: In a real app, the following 3 lines would be the actual API call:
          // const token = localStorage.getItem("token");
          // await axios.post("http://localhost:5001/api/waste/submit", payload, { headers: { Authorization: `Bearer ${token}` } });
          await new Promise(resolve => setTimeout(resolve, 1500)); 

          // --- 2. Update UI/Local State (Mocking success) ---
          
          // Update total CO2 saved and check for new badges
          setCo2Saved(prev => {
              const total = prev + co2;
              const newBadges = [];
              BADGE_THRESHOLDS.forEach(th => {
                  const badgeTitle = `${th} kg CO₂ saved!`;
                  if (total >= th && !badges.includes(badgeTitle)) {
                      newBadges.push(badgeTitle);
                  }
              });
              setBadges(prevBadges => [...prevBadges, ...newBadges]);
              return total;
          });

          // Add a mock entry to the pickups list for immediate visual feedback
          const newPickup = {
              id: Date.now(), // Mock ID
              category,
              weight: numericWeight,
              location: { lat: location.lat.toFixed(3), lng: location.lng.toFixed(3) },
              timestamp: new Date().toISOString(),
              staffName: user,
              co2: co2.toFixed(2),
              status: "Submitted (Mock)"
          };
          setPickups(prev => [newPickup, ...prev]);

          // --- 3. Clean up ---
          setMessage(`Success! CO₂ saved: ${co2.toFixed(2)} kg. Submission mocked.`);
          setWeight("");
          setImage(null);
          setLocation(null);

      } catch (err) {
          // In a real app, use err.response?.data?.message
          setMessage("Error submitting entry (Mocked failure or network issue).");
      } finally {
          setIsSubmitting(false);
      }
  };


  if (loading || !user) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <p className="text-xl font-semibold text-green-600">Checking credentials...</p>
        </div>
    );
  }

  // 5. Main Dashboard View
  return (
    <div className="min-h-screen bg-green-50">
        <MessageBox message={message} onClose={handleMessageClose} />
      
      {/* Navbar */}
      <nav className="bg-green-700 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="font-extrabold text-2xl tracking-wider">VatavaranTrack</div>
        <div className="flex items-center space-x-4">
          <span className="text-lg">Hi, {user} ({role})</span>
          <button 
            onClick={handleLogout} 
            className="bg-white text-green-700 px-4 py-2 rounded-full font-semibold hover:bg-green-100 transition duration-150 shadow"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto mt-10 p-4 grid md:grid-cols-3 gap-6">

        {/* Column 1: Submission Form & Achievements */}
        <div className="md:col-span-1 space-y-6">

            {/* Submission Form */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
                <h2 className="text-2xl font-bold mb-4 text-green-700">Submit Waste Entry</h2>
                
                <div className="space-y-4">
                    <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value)} 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                    >
                        <option value="plastic">Plastic (Factor: {CO2_FACTORS.plastic} kg/kg)</option>
                        <option value="green">Green (Factor: {CO2_FACTORS.green} kg/kg)</option>
                        <option value="dry">Dry (Factor: {CO2_FACTORS.dry} kg/kg)</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Weight (kg)"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        min="0"
                        step="0.01"
                    />

                    <div className="flex flex-col space-y-3">
                        <button 
                            onClick={handleLocation} 
                            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                            disabled={isSubmitting}
                        >
                            {location ? 'Location Captured' : 'Capture Location'}
                        </button>
                        {location && <p className="text-sm text-gray-600 text-center">
                            GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>}
                    </div>

                    <label className="block text-sm font-medium text-gray-700 pt-2">
                        Upload Image (Optional)
                    </label>
                    <input 
                        type="file" 
                        onChange={handleImage} 
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
                        disabled={isSubmitting}
                    />

                    <button
                        onClick={handleSubmitPickup}
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-lg font-semibold transition duration-150 ${
                            isSubmitting ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Entry'}
                    </button>
                </div>
            </div>

            {/* CO₂ Saved and Badges */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-700 mb-4">Achievements</h3>
                <div className="mb-4 p-3 bg-green-100 rounded-lg">
                    <h4 className="font-semibold text-gray-800">Total CO₂ Saved:</h4>
                    <p className="text-3xl font-extrabold text-green-800">{co2Saved.toFixed(2)} kg</p>
                    <p className="text-sm text-gray-600">~ Tree Equivalent: {(co2Saved / 22).toFixed(2)} trees</p>
                </div>

                <div className="mt-4 space-y-2">
                    <p className="font-semibold text-gray-800">Earned Badges:</p>
                    {badges.length > 0 ? (
                        badges.map((b, i) => (
                            <div key={i} className="bg-yellow-100 text-yellow-700 p-2 rounded-lg shadow font-medium flex items-center">
                                <span className="text-xl mr-2">🏅</span> {b}
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">Keep submitting entries to earn your first badge!</p>
                    )}
                </div>
            </div>

        </div>

        {/* Column 2 & 3: My Pickups History */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-700">My Recent Pickups</h2>
            
            <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-3 text-sm font-medium text-gray-600 uppercase tracking-wider">Date/Time</th>
                            <th className="p-3 text-sm font-medium text-gray-600 uppercase tracking-wider">Category</th>
                            <th className="p-3 text-sm font-medium text-gray-600 uppercase tracking-wider">Weight</th>
                            <th className="p-3 text-sm font-medium text-gray-600 uppercase tracking-wider">CO₂ Saved</th>
                            <th className="p-3 text-sm font-medium text-gray-600 uppercase tracking-wider">Location</th>
                            <th className="p-3 text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pickups.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-3 text-center text-gray-500">
                                    No pickups recorded yet. Submit your first entry!
                                </td>
                            </tr>
                        ) : (
                            pickups.map(p => {
                                const dateObj = new Date(p.timestamp);
                                return (
                                    <tr key={p.id} className="border-b hover:bg-green-50 transition duration-100">
                                        <td className="p-3 text-sm text-gray-900">
                                            {dateObj.toLocaleDateString()}
                                            <span className="block text-xs text-gray-500">{dateObj.toLocaleTimeString()}</span>
                                        </td>
                                        <td className="p-3 text-sm font-medium text-gray-900 capitalize">{p.category}</td>
                                        <td className="p-3 text-sm text-gray-900 font-bold">{p.weight} kg</td>
                                        <td className="p-3 text-sm text-green-700">{p.co2} kg</td>
                                        <td className="p-3 text-sm text-gray-900">{p.location.lat}, {p.location.lng}</td>
                                        <td className="p-3 text-sm font-semibold">
                                            <span className="text-yellow-700 bg-yellow-100 p-1 rounded-full text-xs">{p.status}</span>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </div>
  );
}