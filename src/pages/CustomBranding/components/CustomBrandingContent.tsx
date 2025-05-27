/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import LeftItemContent from './LeftItemContent';
import RightItemContent from './RightItemContent';
import Application from '../../../api/app';
import { blobToBase64 } from '../../../help';
import Circleloader from '../../../Components/CircleLoader';
import { publish } from '../../../utils/event';

const CustomBrandingContent = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [customTheme, setCustomTheme] = useState({
    primaryColor: '#6CC24A',
    secondaryColor: '#005F73',
    selectedImage: null as string | null,
    name: '',
    headLine: '',
    lastUpdate: '',
  });
  const [defaultPrimaryColor] = useState('#6CC24A');
  const [defaultSecondaryColor] = useState('#005F73');
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
  const handleResetTheme = () => {
    setCustomTheme((prevTheme) => ({
      ...prevTheme,
      primaryColor: defaultPrimaryColor,
      secondaryColor: defaultSecondaryColor,
      headLine: '',
      selectedImage: null,
    }));
  };
  const getShowBrandInfo = () => {
    Application.getShowBrandInfo().then((res) => {
      setCustomTheme({
        headLine: res.data.brand_elements.headline,
        primaryColor:
          res.data.brand_elements.primary_color || defaultPrimaryColor,
        secondaryColor:
          res.data.brand_elements.secondary_color || defaultSecondaryColor,
        name: res.data.brand_elements.name,
        selectedImage: res.data.brand_elements.logo,
        lastUpdate: res.data.brand_elements.last_update,
      });
      setPageLoading(false);
    });
  };
  useEffect(() => {
    getShowBrandInfo();
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
              <td style="background-color:${customTheme.secondaryColor}; height:16px; border-top-left-radius:20px; border-bottom-left-radius:20px"></td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Main message -->
      <tr>
        <td style="font-size:10px; color:#7C7C7C; text-align:center; padding:16px 48px 0 48px; line-height:1.25rem;">
          Hey <b>{user_name}</b>, your coach <b>{coach_name}</b> has created an account for you on {clinic_name}. Navigate to the magic link and enter the code to access your dashboard.
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
          <a href="{dashboard_link}" style="display:inline-block; background-color:${customTheme.secondaryColor}; color:#333; text-decoration:none; font-size:10px; line-height:24px; padding:0 16px; border-radius:20px; box-shadow:0px 2px 6px rgba(0,0,0,0.1);">
            Access Your Dashboard
          </a>
        </td>
      </tr>

      <!-- Bottom bar -->
      <tr>
        <td style="height:39px; background-color:${customTheme.secondaryColor}; border-bottom-left-radius:20px; border-bottom-right-radius:20px;"></td>
      </tr>
    </table>
  </body>
</html>    
        `,
      };
      Application.saveBrandInfo(data)
        .then(() => {
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
        <div className="fixed inset-0 flex flex-col justify-center items-center bg-white bg-opacity-85 z-20">
          <Circleloader></Circleloader>
        </div>
      )}
      <div className="flex items-center justify-between w-full h-[84vh] mt-6 pb-6">
        <LeftItemContent
          customTheme={customTheme}
          handleImageUpload={handleImageUpload}
          handleResetTheme={handleResetTheme}
          updateCustomTheme={updateCustomTheme}
          handleDeleteImage={handleDeleteImage}
          onSave={onSave}
          loading={loading}
        />
        <RightItemContent customTheme={customTheme} />
      </div>
    </>
  );
};

export default CustomBrandingContent;
