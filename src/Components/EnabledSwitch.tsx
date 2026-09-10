import { isCatalogEnabled } from '../utils/catalogEnabled';

interface EnabledSwitchProps {
  enabled: boolean;
  disabled?: boolean;
  title?: string;
  onChange: (next: boolean) => void;
}

const EnabledSwitch = ({
  enabled,
  disabled,
  title,
  onChange,
}: EnabledSwitchProps) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      title={
        title || (enabled ? 'Disable for new use' : 'Enable for new use')
      }
      onClick={(event) => {
        event.stopPropagation();
        if (disabled) return;
        onChange(!enabled);
      }}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${
        enabled
          ? 'border-Primary-DeepTeal bg-Primary-DeepTeal'
          : 'border-Gray-50 bg-[#E9E9E9]'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
        }`}
      />
      <span className="sr-only">
        {isCatalogEnabled({ is_enabled: enabled }) ? 'Enabled' : 'Disabled'}
      </span>
    </button>
  );
};

export default EnabledSwitch;
