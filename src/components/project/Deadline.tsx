import React, { useState, useEffect } from "react";

export default function DeadlineText({
  deadlineDesign,
  deadlineConstruction,
  deadlineInterior,
}: {
  deadlineDesign: string;
  deadlineConstruction: string;
  deadlineInterior: string;
}) {
  const texts = [
    `Deadline Design: ${deadlineDesign}`,
    `Deadline Construction: ${deadlineConstruction}`,
    `Deadline Interior: ${deadlineInterior}`,
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000); // ganti tiap 3 detik
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="text-center text-sm text-gray-500 dark:text-gray-400 transition-opacity duration-500 ease-in-out">
      <p key={index} className="animate-fade">
        {texts[index]}
      </p>
      <style jsx>{`
        .animate-fade {
          animation: fadeInOut 3s ease-in-out infinite;
        }
        @keyframes fadeInOut {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
