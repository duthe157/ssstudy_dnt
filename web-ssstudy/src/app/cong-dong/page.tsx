import HeroSection from "@/components/community/HeroSection";
import OfficialChannels from "@/components/community/OfficialChannels";
import PublicCommunities from "@/components/community/PublicCommunities";
import StudentCommunities from "@/components/community/StudentCommunities";

export default function CommunityPage() {
  return (
    <main className="flex flex-col gap-16 px-4 md:px-12 py-10">
      <HeroSection />
      <OfficialChannels />
      <PublicCommunities />
      <StudentCommunities />
    </main>
  );
}
