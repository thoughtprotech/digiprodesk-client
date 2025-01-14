/* eslint-disable @typescript-eslint/no-unused-vars */
import MockCardData from "../../../mock/watchListMock.json";
import { Cctv, MapPin, MapPinPlus } from "lucide-react";
import Tooltip from "@/components/ui/ToolTip";
import Layout from "@/components/Layout";
import WatchCard from "./_components/WatchCard";


export default function Index() {
  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };

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
    } header={
      <div>
        <Tooltip tooltip="Preferred Locations" position="bottom">
          <div>
            <MapPin className="w-5 h-5" />
          </div>
        </Tooltip>
      </div>}>
      <div className="w-full h-full overflow-y-auto overflow-x-hidden pb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 items-stretch">
        {MockCardData.map((card, index) => (
          <WatchCard key={index} title={card.title} src="/videos/placeholder.mp4" />
        ))}
      </div>
    </Layout>
  );
}
