import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ListCombo = ({ megaMenuHome }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const menuRef = useRef(null);

  const getBadge = (index) => {
    if (index === 0) {
      return {
        text: "Hot",
        color: "bg-red-500",
        flameShadow: "0 0 15px #ff0000, 0 0 25px #ff3300, 0 0 35px #ff6600",
      };
    } else if (index === 1) {
      return {
        text: "Recommend",
        color: "bg-blue-500",
        flameShadow: "0 0 15px #0066ff, 0 0 25px #0099ff, 0 0 35px #00ccff",
      };
    } else if (index === 2) {
      return {
        text: "Bestseller",
        color: "bg-yellow-500",
        flameShadow: "0 0 15px #ffcc00, 0 0 25px #ffaa00, 0 0 35px #ff8800",
      };
    } else {
      return undefined;
    }
  };

  const programs = megaMenuHome
    ? megaMenuHome.map((group, index) => ({
        icon: `icon-menu-${index + 1}.svg`,
        text: group.name,
        submenu: group.list_subjects.map((subject) => ({
          name: subject.subject_name,
          url: `https://www.ssstudy.vn/khoa-hoc?subject_id=${subject.subject_id}&group_id=${group._id}`,
        })),
        // badge: getBadge(index),
      }))
    : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenIndex(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (index) => {
    const program = programs[index];
    if (program.text === "Sách luyện thi") {
      window.location.href = "/sach";
      return;
    } else {
      setOpenIndex(openIndex === index ? null : index);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Các chương trình học tại SSSTUDY
        </h1>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative"
          ref={menuRef}
        >
          {programs.map((program, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-white shadow-md border relative cursor-pointer"
              onClick={() => toggleMenu(index)}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {program.badge && (
                <>
                  <motion.div
                    className="absolute -top-3 -left-3 w-12 h-12 rounded-full opacity-70"
                    animate={{
                      scale: hoverIndex === index ? [1, 1.25, 1] : [1, 1.1, 1],
                    }}
                    transition={{
                      duration: hoverIndex === index ? 1.5 : 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    style={{ background: program.badge.flameShadow }}
                  />
                  <motion.div
                    className="absolute -top-2.5 -left-2.5 w-10 h-10 rounded-full opacity-80"
                    animate={{
                      scale: hoverIndex === index ? [1, 1.3, 1] : [1, 1.15, 1],
                    }}
                    transition={{
                      duration: hoverIndex === index ? 1.2 : 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.3,
                    }}
                    style={{ background: program.badge.flameShadow }}
                  />
                  <motion.div
                    className="absolute -top-2 -left-2 w-8 h-8 rounded-full opacity-90"
                    animate={{
                      scale: hoverIndex === index ? [1, 1.35, 1] : [1, 1.2, 1],
                    }}
                    transition={{
                      duration: hoverIndex === index ? 0.8 : 1,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.1,
                    }}
                    style={{ background: program.badge.flameShadow }}
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: hoverIndex === index ? 1.2 : 1,
                      opacity: 1,
                      y: hoverIndex === index ? [0, -4, 0] : [0, -2, 0],
                      rotate: hoverIndex === index ? [5, -5, 5] : [3, 0, 3],
                    }}
                    whileHover={{
                      scale: 1.3,
                      rotate: 0,
                      boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                      duration: 0.5,
                      y: {
                        duration: hoverIndex === index ? 1 : 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                      rotate: {
                        duration: hoverIndex === index ? 1.5 : 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      },
                    }}
                    className={`absolute -top-2 -left-2 ${program.badge.color} text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg z-10 transform cursor-pointer`}
                    style={{
                      textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
                      filter:
                        hoverIndex === index
                          ? "brightness(1.2)"
                          : "brightness(1)",
                    }}
                  >
                    {program.badge.text}
                  </motion.div>
                </>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="">
                    <img
                      src={`/icon/${program.icon}`}
                      className="w-[70%] h-[70%] object-contain"
                      alt={program.text}
                    />
                  </span>
                  <span className="font-semibold text-black">
                    {program.text}
                  </span>
                </div>
                <span className="text-gray-500">
                  {program.text === "Sách luyện thi" ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 4L10 8L6 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : openIndex === index ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 3L3 8H13L8 3Z" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M8 13L3 8H13L8 13Z" fill="currentColor" />
                    </svg>
                  )}
                </span>
              </div>
              <AnimatePresence>
                {openIndex === index && program.text !== "Sách luyện thi" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-full -mt-px left-0 w-full bg-white shadow-lg rounded-b-lg p-3 z-50 border border-t-2 border-t-gray-500"
                  >
                    <ul className="space-y-2">
                      {program.submenu.map((item, i) => (
                        <motion.li
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="py-2 px-4 bg-gray-100 rounded-lg shadow-sm cursor-pointer hover:bg-gray-200 transition text-black"
                        >
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-full"
                          >
                            {item.name}
                          </a>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ListCombo;
