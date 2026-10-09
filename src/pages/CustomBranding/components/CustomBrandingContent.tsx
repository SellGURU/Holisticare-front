/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import LeftItemContent from './LeftItemContent';
import RightItemContent from './RightItemContent';
import Application from '../../../api/app';
import { blobToBase64 } from '../../../help';
import Circleloader from '../../../Components/CircleLoader';
import { publish } from '../../../utils/event';
import { fetchBrandInfo } from '../../../utils/brandInfoCache';
import { invalidateBrandInfo } from '../../../utils/cacheKeys';

const CustomBrandingContent = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [customTheme, setCustomTheme] = useState({
    primaryColor: '#6CC24A',
    secondaryColor: '#005F73',
    selectedImage: null as string | null,
    name: '',
    headLine: '',
    lastUpdate: '',
    slug: '',
    coachPhoto: null as string | null,
    coachName: '',
    coachTitle: '',
    coachPhone: '',
    coachEmail: '',
    coachWebsite: '',
    coachSocial: '',
  });
  const [defaultPrimaryColor, setDefaultPrimaryColor] = useState('#6CC24A');
  const [defaultSecondaryColor, setDefaultSecondaryColor] = useState('#005F73');
  const [defaultLogo, setDefaultLogo] = useState('');
  const [defaultHeadLine, setDefaultHeadLine] = useState('');
  const [defaultName, setDefaultName] = useState('');
  const [defaultCoachProfile, setDefaultCoachProfile] = useState({
    coachPhoto: null as string | null,
    coachName: '',
    coachTitle: '',
    coachPhone: '',
    coachEmail: '',
    coachWebsite: '',
    coachSocial: '',
  });
  const updateCustomTheme = (key: keyof typeof customTheme, value: any) => {
    setCustomTheme((prevTheme) => ({
      ...prevTheme,
      [key]: value,
    }));
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      blobToBase64(file).then((resolve: any) => {
        updateCustomTheme('selectedImage', resolve);
      });
    }
  };
  const handleDeleteImage = () => {
    updateCustomTheme('selectedImage', null);
  };
  const handleCoachImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      blobToBase64(file).then((resolve: any) => {
        updateCustomTheme('coachPhoto', resolve);
      });
    }
  };
  const handleDeleteCoachImage = () => {
    updateCustomTheme('coachPhoto', null);
  };
  const handleResetTheme = () => {
    setCustomTheme((prevTheme) => ({
      ...prevTheme,
      name: defaultName,
      primaryColor: defaultPrimaryColor,
      secondaryColor: defaultSecondaryColor,
      headLine: defaultHeadLine,
      selectedImage: defaultLogo,
      ...defaultCoachProfile,
    }));
  };
  const getShowBrandInfo = () => {
    fetchBrandInfo()
      .then((res) => {
        setCustomTheme({
          headLine: res.brand_elements.headline as string,
          primaryColor:
            (res.brand_elements.primary_color as string) || defaultPrimaryColor,
          secondaryColor:
            (res.brand_elements.secondary_color as string) ||
            defaultSecondaryColor,
          name: res.brand_elements.name as string,
          selectedImage: res.brand_elements.logo as string | null,
          lastUpdate: res.brand_elements.last_update as string,
          slug: (res.brand_elements.slug as string) || '',
          coachPhoto: (res.brand_elements.coach_photo as string | null) || null,
          coachName: (res.brand_elements.coach_name as string) || '',
          coachTitle: (res.brand_elements.coach_title as string) || '',
          coachPhone: (res.brand_elements.coach_phone as string) || '',
          coachEmail: (res.brand_elements.coach_email as string) || '',
          coachWebsite: (res.brand_elements.coach_website as string) || '',
          coachSocial: (res.brand_elements.coach_social as string) || '',
        });
        setDefaultLogo(res.brand_elements.logo as string);
        setDefaultHeadLine(res.brand_elements.headline as string);
        setDefaultName(res.brand_elements.name as string);
        setDefaultPrimaryColor(res.brand_elements.primary_color as string);
        setDefaultSecondaryColor(res.brand_elements.secondary_color as string);
        setDefaultCoachProfile({
          coachPhoto: (res.brand_elements.coach_photo as string | null) || null,
          coachName: (res.brand_elements.coach_name as string) || '',
          coachTitle: (res.brand_elements.coach_title as string) || '',
          coachPhone: (res.brand_elements.coach_phone as string) || '',
          coachEmail: (res.brand_elements.coach_email as string) || '',
          coachWebsite: (res.brand_elements.coach_website as string) || '',
          coachSocial: (res.brand_elements.coach_social as string) || '',
        });
        // setDefaultHeadLine()
        setPageLoading(false);
      })
      .catch(() => {
        setPageLoading(false);
      });
  };
  useEffect(() => {
    getShowBrandInfo();
    // Brand info is intentionally loaded once when the page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [loading, setLoading] = useState(false);
  const onSave = () => {
    setLoading(true);
    if (customTheme.name && customTheme.selectedImage) {
      const data: any = {
        logo: customTheme.selectedImage || '',
        name: customTheme.name,
        headline: customTheme.headLine,
        primary_color: customTheme.primaryColor,
        secondary_color: customTheme.secondaryColor,
        coach_photo: customTheme.coachPhoto || '',
        coach_name: customTheme.coachName,
        coach_title: customTheme.coachTitle,
        coach_phone: customTheme.coachPhone,
        coach_email: customTheme.coachEmail,
        coach_website: customTheme.coachWebsite,
        coach_social: customTheme.coachSocial,
        html_email: `
<!DOCTYPE html>
<html>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap" rel="stylesheet">

  <body style="margin:0; padding:0; background-color:#f5f5f5; font-family: Inter;">
    <table align="center" cellpadding="0" cellspacing="0" width="450" style="background-color:#ffffff; border:1px solid #E5E5E5; border-radius:20px; box-shadow:0 4px 12px rgba(0,0,0,0.1); margin-top:40px;">
      <!-- Top bar with logo -->
      <tr>
        <td style="padding:12px 0px 0px 8px;">
          <table cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="60">
                <img src="{logo_url}" alt="logo" width="24" height="24" style="display:block; border:0;" />
              </td>
              <td bgcolor="{primary_color}" style="background-color:{primary_color}; height:16px; border-top-left-radius:20px; border-bottom-left-radius:20px"></td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main message -->
      <tr>
        <td style="font-size:10px; color:#7C7C7C; text-align:center; padding:16px 48px 0 48px; line-height:1.25rem;">
          Hey <b>{user_name}</b>, your coach <b>{coach_name}</b> has created an account for you on {clinic_name}. Open https://app.holisticare.io/?clinic={clinic_slug} and enter the code to access your dashboard.
        </td>
      </tr>

      <!-- User info -->
      <tr>
        <td align="center" style="padding:16px 0 24px 0;">
          <table cellpadding="0" cellspacing="0" style="font-size:10px; color:#333;">
            <tr>
              <td style="padding-right:40px;">User name: <b>{user_name}</b></td>
              <td>Code: <b>{user_code}</b></td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Button -->
      <tr>
        <td align="center" style="padding-top:0px;padding-bottom:24px">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" bgcolor="{primary_color}" style="background-color:{primary_color}; border-radius:20px;">
                <a href="{dashboard_link}" style="display:inline-block; padding:8px 16px; font-size:10px; line-height:16px; color:#ffffff !important; text-decoration:none; font-family:Inter,Arial,sans-serif;">
                  Access Your Dashboard
                </a>
              </td>
            </tr>
          </table>
          <div style="font-size:10px; color:#7C7C7C; padding-top:8px;">https://app.holisticare.io/?clinic={clinic_slug}</div>
        </td>
      </tr>

      <!-- Bottom bar -->
      <tr>
        <td bgcolor="{primary_color}" style="height:39px; background-color:{primary_color}; border-bottom-left-radius:20px; border-bottom-right-radius:20px;"></td>
      </tr>
    </table>
  </body>
</html>    
        `,
      };
      Application.saveBrandInfo(data)
        .then(() => {
          invalidateBrandInfo();
          getShowBrandInfo();
          publish('refreshBrandInfo', {});
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };
  return (
    <>
      {pageLoading && (
        <div className="fixed inset-0 flex  flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="grid h-full min-h-0 w-full grid-cols-1 items-stretch gap-5 overflow-y-auto lg:grid-cols-[minmax(320px,380px)_minmax(0,1fr)] lg:overflow-hidden">
        <LeftItemContent
          customTheme={customTheme}
          handleImageUpload={handleImageUpload}
          handleResetTheme={handleResetTheme}
          updateCustomTheme={updateCustomTheme}
          handleDeleteImage={handleDeleteImage}
          handleCoachImageUpload={handleCoachImageUpload}
          handleDeleteCoachImage={handleDeleteCoachImage}
          onSave={onSave}
          loading={loading}
          pageLoading={pageLoading}
        />
        <RightItemContent customTheme={customTheme} />
      </div>
    </>
  );
};

export default CustomBrandingContent;
