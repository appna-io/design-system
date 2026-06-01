import { Checkbox, Div, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo showing unchecked, checked, indeterminate, and labeled checkbox states.
 */
export default function Overview() {
  return (
    <Div display="flex" alignItems="flex-start" gap="6">
      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-24">
        <Checkbox aria-label="Unchecked option" />
        <Typography variant="caption" color="fg.muted" align="center">
          Unchecked
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-24">
        <Checkbox defaultChecked aria-label="Checked option" />
        <Typography variant="caption" color="fg.muted" align="center">
          Checked
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-24">
        <Checkbox indeterminate aria-label="Partially selected" />
        <Typography variant="caption" color="fg.muted" align="center">
          Indeterminate
        </Typography>
      </Div>
      <Div display="flex" flexDirection="column" alignItems="center" gap="2" className="w-28">
        <Checkbox defaultChecked>Email me updates</Checkbox>
        <Typography variant="caption" color="fg.muted" align="center">
          With label
        </Typography>
      </Div>
    </Div>
  );
}