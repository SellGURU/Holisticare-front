import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../Components/ui/card';
import { Button } from '../../Components/ui/button';
import TextField from '../../Components/TextField';
import Admin, { VersionControlData } from '../../api/Admin';
import { toast } from 'react-toastify';

type Platform = 'web_main' | 'web_test' | 'ios' | 'android' | 'pwa';

const activePlatforms: Platform[] = ['ios', 'android'];
const disabledPlatforms: Platform[] = ['web_main', 'web_test', 'pwa'];

const platformLabels: Record<
  Platform,
  { title: string; description: string; icon: string }
> = {
  web_main: {
    title: 'Web App - Main',
    description: 'Version control for main web application link',
    icon: '🌐',
  },
  web_test: {
    title: 'Web App - Test',
    description: 'Version control for test web application link',
    icon: '🧪',
  },
  ios: {
    title: 'iOS Version',
    description: 'Version control for iOS application',
    icon: '📱',
  },
  android: {
    title: 'Android Version',
    description: 'Version control for Android application',
    icon: '🤖',
  },
  pwa: {
    title: 'PWA Version',
    description: 'Version control for Progressive Web App',
    icon: '⚡',
  },
};

const VersionControl = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasDataFromBackend, setHasDataFromBackend] = useState(false);
  const [versions, setVersions] = useState<VersionControlData>({
    web_main: { version: '', minimumSupportedVersion: '', maintenance: false, downloadLink: '' },
    web_test: { version: '', minimumSupportedVersion: '', maintenance: false, downloadLink: '' },
    ios: { version: '', minimumSupportedVersion: '', maintenance: false, downloadLink: '' },
    android: { version: '', minimumSupportedVersion: '', maintenance: false, downloadLink: '' },
    pwa: { version: '', minimumSupportedVersion: '', maintenance: false, downloadLink: '' },
  });

  useEffect(() => {
    fetchVersionControl();
  }, []);

  const fetchVersionControl = async () => {
    try {
      setLoading(true);
      const response = await Admin.getVersionControl();
      // Check if data exists directly in response.data or in response.data.data
      const versionData = response.data?.data || response.data;

      if (versionData && typeof versionData === 'object') {
        // Ensure all required fields exist with default values
        setVersions({
          web_main: {
            version: versionData.web_main?.version || '',
            minimumSupportedVersion:
              versionData.web_main?.minimumSupportedVersion || '',
            maintenance: versionData.web_main?.maintenance ?? false,
            downloadLink: versionData.web_main?.downloadLink || '',
          },
          web_test: {
            version: versionData.web_test?.version || '',
            minimumSupportedVersion:
              versionData.web_test?.minimumSupportedVersion || '',
            maintenance: versionData.web_test?.maintenance ?? false,
            downloadLink: versionData.web_test?.downloadLink || '',
          },
          ios: {
            version: versionData.ios?.version || '',
            minimumSupportedVersion:
              versionData.ios?.minimumSupportedVersion || '',
            maintenance: versionData.ios?.maintenance ?? false,
            downloadLink: versionData.ios?.downloadLink || '',
          },
          android: {
            version: versionData.android?.version || '',
            minimumSupportedVersion:
              versionData.android?.minimumSupportedVersion || '',
            maintenance: versionData.android?.maintenance ?? false,
            downloadLink: versionData.android?.downloadLink || '',
          },
          pwa: {
            version: versionData.pwa?.version || '',
            minimumSupportedVersion:
              versionData.pwa?.minimumSupportedVersion || '',
            maintenance: versionData.pwa?.maintenance ?? false,
            downloadLink: versionData.pwa?.downloadLink || '',
          },
        });
        setHasDataFromBackend(true);
      } else {
        setHasDataFromBackend(false);
      }
    } catch (error: unknown) {
      console.error('Error fetching version control:', error);
      // If API doesn't exist yet or returns empty, use default values
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number } };
        if (
          apiError.response?.status === 404 ||
          apiError.response?.status === 200
        ) {
          setHasDataFromBackend(false);
        } else {
          toast.error('Error fetching version control data');
        }
      } else {
        setHasDataFromBackend(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVersionChange = (platform: Platform, value: string) => {
    if (!activePlatforms.includes(platform)) return;
    if (versions[platform].maintenance) return;

    setVersions((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        version: value,
      },
    }));
  };

  const handleMinimumSupportedVersionChange = (
    platform: Platform,
    value: string,
  ) => {
    if (!activePlatforms.includes(platform)) return;
    if (versions[platform].maintenance) return;

    setVersions((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        minimumSupportedVersion: value,
      },
    }));
  };

  const handleMaintenanceToggle = (platform: Platform) => {
    setVersions((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        maintenance: !prev[platform].maintenance,
      },
    }));
  };

  const handleDownloadLinkChange = (
    platform: Platform,
    value: string,
  ) => {
    if (!activePlatforms.includes(platform)) return;
    if (versions[platform].maintenance) return;

    setVersions((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        downloadLink: value,
      },
    }));
  };

  const handleSaveAll = async () => {
    // Validate active platforms
    const hasErrors = activePlatforms.some((platform) => {
      const versionData = versions[platform];
      return !versionData.version.trim();
    });

    if (hasErrors) {
      toast.error(
        'Please enter version for all active platforms (iOS and Android)',
      );
      return;
    }

    try {
      setSaving(true);
      await Admin.saveVersionControl(versions);
      toast.success('Version control data saved successfully');
      setHasDataFromBackend(true);
    } catch (error: unknown) {
      console.error('Error saving version control:', error);
      toast.error('Error saving version control data');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-Primary-DeepTeal mx-auto"></div>
          <p className="mt-4 text-Text-Primary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-bg-color min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-Text-Primary mb-2">
              Application Version Control
            </h1>
            <p className="text-Text-Secondary">
              Manage version and minimum supported version settings for each
              platform
            </p>
          </div>
          <Button
            onClick={handleSaveAll}
            disabled={saving}
            className="bg-Primary-DeepTeal hover:bg-Primary-DeepTeal/90 text-white px-6"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </span>
            ) : (
              'Save All'
            )}
          </Button>
        </div>

        {!hasDataFromBackend && (
          <div className="mb-6 p-4 bg-Orange/10 border border-Orange/20 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-Text-Primary mb-1">
                  No Data from Backend
                </h3>
                <p className="text-sm text-Text-Secondary">
                  No version control data found. Please configure the versions
                  and click "Save All" to create and send the JSON to the
                  backend.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(platformLabels) as Platform[]).map((platform) => {
            const label = platformLabels[platform];
            const versionData = versions[platform];
            const isDisabled = disabledPlatforms.includes(platform);
            const isMaintenance = versionData.maintenance;
            const isFullyDisabled = isDisabled || isMaintenance;

            return (
              <Card
                key={platform}
                className={`bg-backgroundColor-Card border-Boarder shadow-sm ${
                  isFullyDisabled ? 'opacity-60' : ''
                } ${isMaintenance ? 'border-Orange' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{label.icon}</span>
                      <div>
                        <CardTitle className="text-lg text-Text-Primary">
                          {label.title}
                          {isDisabled && (
                            <span className="ml-2 text-xs text-Text-Triarty">
                              (Disabled)
                            </span>
                          )}
                          {isMaintenance && (
                            <span className="ml-2 text-xs text-Orange font-semibold">
                              (Under Maintenance)
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs text-Text-Secondary mt-1">
                          {label.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isMaintenance}
                          onChange={() => handleMaintenanceToggle(platform)}
                          className="w-4 h-4 text-Orange border-Gray-200 rounded focus:ring-Orange focus:ring-2"
                        />
                        <span className="text-xs text-Text-Secondary">
                          Maintenance
                        </span>
                      </label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <TextField
                      label="Current Version"
                      type="text"
                      value={versionData.version}
                      onChange={(e) =>
                        handleVersionChange(platform, e.target.value)
                      }
                      placeholder="Example: 1.0.0"
                      className="w-full"
                      newStyle
                      disabled={isFullyDisabled}
                    />
                    <p className="text-[10px] text-Text-Triarty mt-1">
                      Version format: x.y.z (Example: 1.2.3)
                    </p>
                  </div>

                  <div>
                    <TextField
                      label="Minimum Supported Version"
                      type="text"
                      value={versionData.minimumSupportedVersion}
                      onChange={(e) =>
                        handleMinimumSupportedVersionChange(
                          platform,
                          e.target.value,
                        )
                      }
                      placeholder="Example: 1.0.0"
                      className="w-full"
                      newStyle
                      disabled={isFullyDisabled}
                    />
                    <p className="text-[10px] text-Text-Triarty mt-1">
                      Versions below this will require update (format: x.y.z)
                    </p>
                  </div>

                  <div>
                    <TextField
                      label="Download Link"
                      type="text"
                      value={versionData.downloadLink || ''}
                      onChange={(e) =>
                        handleDownloadLinkChange(
                          platform,
                          e.target.value,
                        )
                      }
                      placeholder="https://example.com/download"
                      className="w-full"
                      newStyle
                      disabled={isFullyDisabled}
                    />
                    <p className="text-[10px] text-Text-Triarty mt-1">
                      Link to download the application
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-Orange/10 border border-Orange/20 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-Text-Primary mb-1">
                Usage Guide
              </h3>
              <ul className="text-sm text-Text-Secondary space-y-1 list-disc list-inside">
                <li>Only iOS and Android platforms are currently active</li>
                <li>
                  Enter the current version for active platforms (format: x.y.z)
                </li>
                <li>
                  Set minimum supported version - users with versions below this
                  will be required to update
                </li>
                <li>
                  If minimum supported version is empty, all versions are
                  supported
                </li>
                <li>
                  Click "Save All" to save the complete JSON data to the backend
                </li>
                <li>All version data is stored in a single JSON object</li>
                <li>
                  Enable "Maintenance" mode to disable a platform during
                  maintenance or reconstruction
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionControl;
