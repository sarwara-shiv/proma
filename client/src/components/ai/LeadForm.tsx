import { saveLead } from "../../hooks/aiHooks";
import React, { useState } from "react";

const LeadForm: React.FC = () => {
  const [leadData, setLeadData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    projectType: "",
    budget: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLeadData({ ...leadData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await saveLead({leadData});
      alert("Lead saved successfully!");
    } catch (error) {
      alert("Error saving lead.");
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-5 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-3">Submit Your Project</h2>
      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        className="w-full p-2 mb-3 border rounded-md"
        onChange={handleChange}
      />
      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        className="w-full p-2 mb-3 border rounded-md"
        onChange={handleChange}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="w-full p-2 mb-3 border rounded-md"
        onChange={handleChange}
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone"
        className="w-full p-2 mb-3 border rounded-md"
        onChange={handleChange}
      />
      <input
        type="text"
        name="projectType"
        placeholder="Project Type"
        className="w-full p-2 mb-3 border rounded-md"
        onChange={handleChange}
      />
      <input
        type="text"
        name="budget"
        placeholder="Budget"
        className="w-full p-2 mb-3 border rounded-md"
        onChange={handleChange}
      />
      <button
        className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default LeadForm;
