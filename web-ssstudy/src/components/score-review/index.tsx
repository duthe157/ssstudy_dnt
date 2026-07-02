"use client";

import {useHome} from "@/contexts/HomeContext";
import {Banner} from "./Banner";
import HonorBoard from "./HonorBoard";
import ParentInterviews from "./ParentInterviews";
import StudentFeedback from "./StudentFeedback";
import StudentStory from "./StudentStory";
import "./style.scss";
import {useEffect} from "react";
import AchievementBoard from "@/components/home/achievement-board/index";

const ScoreReview = () => {
  const {dataHomePage, getDataHomePage, isDataLoaded} = useHome();
  
  useEffect(() => {
    if (!isDataLoaded) {
      getDataHomePage();
    }
  }, [getDataHomePage, isDataLoaded]);
  return (
    <div className="min-h">
      <Banner />
      <AchievementBoard items={dataHomePage?.topRanks} />
      {/* <HonorBoard /> */}
      <StudentFeedback />
      <StudentStory />
      <ParentInterviews />
    </div>
  );
};

export default ScoreReview;
