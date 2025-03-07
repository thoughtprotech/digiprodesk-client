/* eslint-disable @typescript-eslint/no-explicit-any */
import DateRangeSelect from '@/components/ui/DateRangeSelect';
import { Calendar, Clock, User, X } from 'lucide-react';
import { parseCookies } from 'nookies';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type DrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    user?: any;
};

interface LocationInfo {
    LocationID: number;
    LocationName: string;
    LocationCode: string;
    LocationParentID: number;
    LocationType: string;
    LocationManager: string | null;
    LocationLogo: string | null;
    LocationImage: string | null;
    LocationBanner: string | null;
    LocationVideoFeed: string;
    LocationReceptionistPhoto: string | null;
    LocationAdvertisementVideo: string | null;
    IsActive: boolean;
    CreatedBy: string;
    CreatedOn: string; // ISO date string
    ModifiedBy: string | null;
    ModifiedOn: string; // ISO date string
}

interface CallData {
    CallStartDateTime: string; // ISO date string
    CallEndDateTime: string | null;
    CallPlacedByUserName: string;
    CallTransferredTo: string;
    LocationInfo: LocationInfo;
}


const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, user }) => {
    const [callData, setCallData] = useState<CallData[]>();

    const fetchCallData = async (startDate?: string) => {
        const cookies = parseCookies();
        const { userToken } = cookies;

        if (startDate === '' || startDate === undefined) {
            startDate = new Date().toISOString();
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/users/${user}?startDate=${startDate}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application',
                'Authorization': `Bearer ${userToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log({ data });
            setCallData(data);
        } else {
            toast.error('Failed to fetch call data');
        }
    };

    useEffect(() => {
        fetchCallData();
        console.log(user);
    }, [user]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div
                className={`fixed z-[999] top-0 right-0 h-full w-1/3 bg-background shadow-lg transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className='w-full flex items-center justify-between px-4 border-b border-b-border'>
                    <div>
                        <h1 className='text-3xl font-bold'>{user}</h1>
                    </div>
                    <div className="p-4">
                        <button
                            onClick={onClose}
                            className="text-text focus:outline-none"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className='p-4 w-full h-full flex flex-col gap-2'>
                    <div className='w-full flex justify-between items-center gap-2'>
                        <div>
                            <h1 className='text-xl font-bold'>Call History</h1>
                        </div>
                        <div>
                            <DateRangeSelect callBack={(startDate) => fetchCallData(startDate)} />
                        </div>
                    </div>
                    {
                        callData?.length !== 0 ? (

                            <div className='w-full h-full flex flex-col gap-2 overflow-y-auto'>
                                {callData?.map((call, index) => (
                                    <div key={index} className='w-full bg-foreground rounded-md p-2 flex flex-col gap-2'>
                                        <div className='flex items-center gap-2'>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                                <h1 className="font-bold text-2xl text-textAlt">{call?.LocationInfo?.LocationName?.split(' ').slice(0, 2).slice(0, 2).map(word => word[0]).join('').toUpperCase()}</h1>
                                            </div>
                                            <h1 className='font-bold text-xl'>{call?.LocationInfo?.LocationName}</h1>
                                        </div>
                                        <div className='w-full flex gap-2'>
                                            <div className='flex items-center gap-2'>
                                                <Calendar className='text-textAlt w-6 h-6' />
                                                <h1 className='font-bold text-textAlt'>{new Date(call?.CallStartDateTime).toLocaleDateString()}</h1>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <Clock className='text-textAlt w-6 h-6' />
                                                <div>
                                                    <h1 className='font-bold text-textAlt'>
                                                        {new Date(call?.CallStartDateTime).toLocaleTimeString()} - {call?.CallEndDateTime ? new Date(call?.CallEndDateTime).toLocaleTimeString() : 'N/A'}
                                                    </h1>
                                                </div>
                                            </div>
                                            {
                                                call?.CallTransferredTo && (
                                                    <div className='flex items-center gap-2'>
                                                        <User className='text-textAlt w-6 h-6' />
                                                        <div>
                                                            <h1 className='font-bold text-textAlt'>
                                                                {call?.CallTransferredTo}
                                                            </h1>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </div>
                                ))
                                }
                            </div>
                        ) : (
                            <div className='w-full h-full flex items-center justify-center'>
                                <p className='text-lg font-medium'>No call data available</p>
                            </div>
                        )
                    }
                </div>
            </div>
        </>
    );
};

export default Drawer;
