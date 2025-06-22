import Api from './api';
import patients from './data/patients.json';
const useMoch = () => {
  Api.get('/patients', patients);
};

export default useMoch;
