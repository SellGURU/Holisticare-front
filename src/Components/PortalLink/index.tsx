import { Link, LinkProps } from 'react-router-dom';
import { normalizePortalPath } from '../../utils/navigation';

type PortalLinkProps = Omit<LinkProps, 'to'> & {
  to: string;
};

const PortalLink = ({ to, ...props }: PortalLinkProps) => {
  return <Link to={normalizePortalPath(to)} {...props} />;
};

export default PortalLink;
