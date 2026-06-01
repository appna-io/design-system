import { Pagination } from '@apx-ui/ds';

/**
 * Quick-review demo: a full pagination bar on page 3 of 12 with range label and page-size picker.
 */
export default function Overview() {
  return (
    <Pagination
      totalCount={120}
      pageSize={10}
      pageIndex={2}
      pageSizeOptions={[10, 25, 50]}
      onChange={({ pageIndex, pageSize }) => {
        console.log({ pageIndex, pageSize });
      }}
    />
  );
}