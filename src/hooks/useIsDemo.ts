import { useApp } from '.';

const useIsDemo = () => {
  const { clinicPlan } = useApp();
  return clinicPlan === 'demo';
};

export default useIsDemo;
