import MockCardData from "../../../mock/watchListMock.json";
import Layout from "@/components/Layout";
import WatchCard from "./_components/WatchCard";
import VideoViewer from "@/components/ui/videoViewer";
import Button from "@/components/ui/Button";
import { PhoneOutgoing } from "lucide-react";

export default function Index() {
  return (
    <Layout headerTitle={
      <div className='flex items-center gap-2'>
        <div className="border-r border-r-border pr-2">
          <h1 className="font-bold text-xl">OLIVE HEAD OFFICE</h1>
        </div>
        <div>
          <h1 className='font-bold text-lg'>WATCH CENTER</h1>
        </div>
      </div>
    }>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden pb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 items-stretch">
        {MockCardData.map((card, index) => (
          <VideoViewer key={index} title={card.title} src="/videos/placeholder.mp4"
            component={
              <Button text="Call" color="green" icon={<PhoneOutgoing className="w-5 h-5" />} />
            }
          >
            <WatchCard title={card.title} src="/videos/placeholder.mp4" />
          </VideoViewer>
        ))}
      </div>
    </Layout>
  );
}
