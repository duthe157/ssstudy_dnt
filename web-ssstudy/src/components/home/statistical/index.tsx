import React, { useState, useEffect } from 'react';

const Statistical = ({ items }) => {
  const [satisfaction, setSatisfaction] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
  const [teamMembers, setTeamMembers] = useState(0);
  const [companyGrowth, setCompanyGrowth] = useState(0);

  useEffect(() => {
    if (items?.length > 0) {
      const targetValues = { satisfaction: items[0]?.num, activeUsers: items[1]?.num, teamMembers: items[2]?.num, companyGrowth: items[3]?.num };
      const duration = 2000; // 1 second
      const stepTime = 10; // 10 milliseconds per step
      const steps = duration / stepTime;

      const interval = setInterval(() => {
        setSatisfaction((prev) => (prev < targetValues.satisfaction ? Math.ceil(prev + targetValues.satisfaction / steps) : targetValues.satisfaction));
        setActiveUsers((prev) => (prev < targetValues.activeUsers ? Math.ceil(prev + targetValues.activeUsers / steps) : targetValues.activeUsers));
        setTeamMembers((prev) => (prev < targetValues.teamMembers ? Math.ceil(prev + targetValues.teamMembers / steps) : targetValues.teamMembers));
        setCompanyGrowth((prev) => (prev < targetValues.companyGrowth ? Math.ceil(prev + targetValues.companyGrowth / steps) : targetValues.companyGrowth));
      }, stepTime);

      return () => clearInterval(interval);
    }
  }, [items]);

  return (
    <div className='max-w-[1440px] mx-auto px-8 sm:px-12 lg:px-16'>
      { items?.length > 0 && <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-2 sm:gap-y-4 md:grid-cols-4 lg:grid-cols-4 bg-white py-8">
        <div className="text-center">
          <h2 className="text-blue-600 text-3xl font-bold">{satisfaction}+</h2>
          <p className="text-gray-600 font-bold">{items[0]?.title}</p>
        </div>
        <div className="text-center">
          <h2 className="text-blue-600 text-3xl font-bold">{activeUsers} năm</h2>
          <p className="text-gray-600 font-bold">{items[1]?.title}</p>
        </div>
        <div className="text-center">
          <h2 className="text-blue-600 text-3xl font-bold">{teamMembers}+</h2>
          <p className="text-gray-600 font-bold">{items[2]?.title}</p>
        </div>
        <div className="text-center">
          <h2 className="text-blue-600 text-3xl font-bold">{companyGrowth}+</h2>
          <p className="text-gray-600 font-bold">{items[3]?.title}</p>
        </div>
      </div> }
    </div>
  );
};

export default Statistical;
