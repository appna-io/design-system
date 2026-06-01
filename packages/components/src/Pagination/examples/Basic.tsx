import { Pagination } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Pagination
      totalCount={120}
      defaultPageSize={25}
      onChange={({ pageIndex, pageSize }) => {
        console.log({ pageIndex, pageSize });
      }}
    />
  );
}