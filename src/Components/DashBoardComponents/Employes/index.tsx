import { ButtonPrimary } from '../../Button/ButtonPrimary';

interface Employee {
  name: string;
  role: string;
  avatar: string; // URL to the avatar image
}
const employeesData: Employee[] = [
  { name: 'Sarah Thompson', role: 'Doctor', avatar: '/path/to/avatar1.jpg' },
  { name: 'John Doe', role: 'Admin', avatar: '/path/to/avatar2.jpg' },
  { name: 'Emi Thompson', role: 'Admin', avatar: '/path/to/avatar3.jpg' },
  { name: 'Sarah Jonas', role: 'Admin', avatar: '/path/to/avatar4.jpg' },
  { name: 'David Smith', role: 'Admin', avatar: '/path/to/avatar5.jpg' },
];

const Employes: React.FC = () => {
  return (
    <div className="w-full h-[320px] overflow-hidden bg-white rounded-2xl shadow-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm text-Text-Primary font-medium">Employes</h2>

        <ButtonPrimary size="small">view all</ButtonPrimary>
      </div>
      <ul className="space-y-3 max-h-[283px] overflow-auto">
        {employeesData.map((employee, index) => (
          <li key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={`https://ui-avatars.com/api/?name=${employee.name}`}
                alt={`${employee.name}'s avatar`}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="text-[10px] text-[#383838]">{employee.name}</p>
                <p className="text-[10px] text-[#888888]">{employee.role}</p>
              </div>
            </div>
            <img
              className={'cursor-pointer'}
              src="/icons/client-card/more.svg"
              alt=""
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Employes;
