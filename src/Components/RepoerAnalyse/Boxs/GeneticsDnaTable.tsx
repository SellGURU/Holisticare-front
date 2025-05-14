/* eslint-disable @typescript-eslint/no-explicit-any */
interface GeneticsData {
  gene_name: string;
  rsID: string;
  reference: string;
  your_genotype: string;
}

interface GeneticsDnaTableProps {
  data: GeneticsData[];
}

const GeneticsDnaTable: React.FC<GeneticsDnaTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-[345px] rounded-lg bg-white text-[10px]">
        <thead>
          <tr className="bg-bg-color rounded-t-lg">
            <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Gene Name</th>
            <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">rsID</th>
            <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Reference</th>
            <th className="px-2 py-2 text-left font-medium text-gray-500 uppercase tracking-wider">Your Genotype</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className={`${index % 2 !== 0 ? 'bg-[#F4F4F4]' : 'bg-white'} hover:bg-gray-50`}>
              <td className="px-2 py-2 whitespace-nowrap text-[#383838]">{item.gene_name}</td>
              <td className="px-2 py-2 whitespace-nowrap text-[#888888]">{item.rsID}</td>
              <td className="px-2 py-2 whitespace-nowrap text-[#888888]">{item.reference}</td>
              <td className="px-2 py-2 whitespace-nowrap text-[#888888]">{item.your_genotype}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GeneticsDnaTable;
