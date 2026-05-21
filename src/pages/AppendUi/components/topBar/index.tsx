import { ChevronRight, Search, Bell } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { publish, subscribe } from "../../../../utils/event";
import Application from "../../../../api/app";
import { useLocation, useNavigate } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import { Notification } from '../../../../Components/Notification';
import NotificationApi from "../../../../api/Notification";
import useModalAutoClose from "../../../../hooks/UseModalAutoClose";

const PAGE_TITLES: Record<string, string> = {
    '/': 'Client List',
    '/dashboard': 'Dashboard',
    '/drift-analysis': 'Drift Analysis',
    '/aiKnowledge': 'Knowledge Graph',
    '/messages': 'Messages',
    '/setting': 'Settings',
    '/packages': 'Packages',
    '/forms': 'Forms',
    '/staff': 'Staff Management',
    '/biomarkers': 'Biomarkers',
    '/json-uploading': 'Json Uploading',
    '/custom-branding': 'Branding',
    '/activity': 'Activity',
    '/supplement': 'Supplement',
    '/lifestyle': 'Lifestyle',
    '/diet': 'Intervention Library',
    '/peptide': 'Peptide',
    '/other': 'Other',
    '/fhir-integration': 'FHIR',
    '/playground': 'Playground',
    '/addClient': 'Add Client',
};

const getPageTitleFromPath = (pathname: string): string => {
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    if (pathname.startsWith('/drift-analysis/client')) return 'Client Profile';
    if (pathname.startsWith('/report/Generate-Action-Plan')) return 'Generate Action Plan';
    if (pathname.startsWith('/report/Generate-Holistic-Plan')) return 'Generate Holistic Plan';
    if (pathname.startsWith('/report/Generate-Recommendation')) return 'Generate Recommendation';
    if (pathname.startsWith('/report/')) return 'Client Report';

    const segment = pathname.split('/').filter(Boolean)[0] ?? '';
    if (!segment) return 'Client List';
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
};

const TopBar =() => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotification, setshowNotification] = useState(false);
    const [isUnReadNotif, setisUnReadNotif] = useState(false);
    const [unreadNotificationIds, setUnreadNotificationIds] = useState<string[]>(
        [],
    );
//   const refrence = useRef(null);
//   const buttentRef = useRef(null);
  const notifRefrence = useRef(null);
  const notifButtentRef = useRef(null);    
    useModalAutoClose({
        refrence: notifRefrence,
        buttonRefrence: notifButtentRef,
        close: () => {
        setshowNotification(false);

        // Mark all unread notifications as read when the modal closes (Boss's requirement)
        if (unreadNotificationIds.length > 0) {
            console.log(
            `Marking ${unreadNotificationIds.length} notifications as read on modal close.`,
            );
            unreadNotificationIds.forEach((id) => {
            NotificationApi.readNotification(id); // Send API call for each
            });
            setisUnReadNotif(false); // Immediately hide the dot in MainTopBar
            setUnreadNotificationIds([]); // Clear the list
        }

        // Update lastUsed timestamp after processing all unreads
        // This is crucial: the user has acknowledged everything up to this moment.
        NotificationApi.lastUsed = new Date();
        localStorage.setItem('lastNotif', JSON.stringify(new Date().getTime()));
        },
    });    
    const pageTitle = useMemo(
        () => getPageTitleFromPath(location.pathname),
        [location.pathname],
    );
    const [customTheme, setCustomTheme] = useState(
        localStorage.getItem('brandInfoData')
        ? JSON.parse(localStorage.getItem('brandInfoData') || '{}')
        : {
            selectedImage: null as string | null,
            name: '',
            headLine: '',
            },
    );    
    const getShowBrandInfo = () => {
        Application.getShowBrandInfo()
        .then((res) => {
            if (
            res.data.brand_elements.name === null ||
            res.data.brand_elements.name === '' ||
            res.data.brand_elements.logo === null
            ) {
            navigate('/register-profile');
            return;
            }
            setCustomTheme({
                headLine: res.data.brand_elements.headline,
                name: res.data.brand_elements.name,
                selectedImage: res.data.brand_elements.logo,
            });
            localStorage.setItem(
            'brandInfoData',
            JSON.stringify({
                headLine: res.data.brand_elements.headline,
                name: res.data.brand_elements.name,
                selectedImage: res.data.brand_elements.logo,
            }),
            );
            if (res.data.brand_elements.knowledge_playground == true) {
            publish(
                'knowledge_playground-Show',
                res.data.brand_elements.knowledge_playground,
            );
            }
            if (res.data.brand_elements.permission) {
            publish('permissions-show', res.data.brand_elements.permission);
            }
        })
        .catch(() => {});
    };

    useEffect(() => {
        getShowBrandInfo();

        // Subscribe to refresh event
        subscribe('refreshBrandInfo', () => {
        getShowBrandInfo();
        });
    }, []);   
    useEffect(() => {
        const checkNewNotifications = async () => {
        try {
            const response = await NotificationApi.checkNotification();
            if (response && response.data && response.data.new_notifications) {
                setisUnReadNotif(true);
            }
        } catch (error) {
            console.error('Error checking for new notifications:', error);
        }
        };

        checkNewNotifications();

        const intervalId = setInterval(checkNewNotifications, 120000);

        return () => clearInterval(intervalId);
    }, []);     
    return (
        <>
        <div className="flex-1 flex flex-col min-w-0">
            <header className="h-[52px] bg-white border-b border-gray-200 flex items-center justify-between md:pl-[250px] px-6 flex-shrink-0">
            <div className="flex items-center gap-2 text-[13px]">
                <span className="text-gray-400">Clinic</span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                <span className="text-gray-800 font-semibold">
                    {pageTitle}
                </span>
            </div>
            <div className="flex items-center gap-3">
                <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-150">
                <Search className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                ref={notifButtentRef}
                onClick={() => setshowNotification(!showNotification)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center relative transition-colors duration-150">
                <Bell className="w-4 h-4 text-gray-400" />
                {isUnReadNotif && 
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                }
                </button>
                <div className="w-[1px] h-5 bg-gray-200" />
                <div className="flex items-center gap-2">
                {customTheme.selectedImage ? (
                  <img
                    className="size-8 rounded-full border  "
                    src={customTheme.selectedImage}
                    alt=""
                  />
                ) : (
                  <div className="w-full h-5 flex justify-center items-center">
                    <BeatLoader size={6}></BeatLoader>
                  </div>
                )}
                <div>
                    <p className="text-[12px] font-semibold text-gray-800 leading-tight">
                    {/* Dr. Raina Holt */}
                    {customTheme.name ? customTheme.name : ''}{' '}
                    </p>
                    <p className="text-[10px] text-gray-400 leading-tight">
                    {customTheme.headLine?customTheme.headLine:''}
                    </p>
                </div>
                </div>
                {showNotification && (
                    <Notification
                        onUnreadNotificationsChange={setUnreadNotificationIds}
                        refrence={notifRefrence}
                        setisUnReadNotif={(value) => {
                        setisUnReadNotif(value);
                        }}
                    />
                )}
            
            </div>
            </header>

        </div>        
        </>
    )
}
export default TopBar