"use client";

import { useState, useEffect } from "react";

export default function JobTitleRotator() {
  const [jobIndex, setJobIndex] = useState(0);
  const jobs = [
    "Traiteur",
    "Boulangerie",
    "Pâtisserie",
    "Boutique",
    "Restaurant",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setJobIndex((prev) => (prev + 1) % jobs.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="block text-blue-600 transition-opacity duration-500">
      de {jobs[jobIndex]} simplement
    </span>
  );
}
