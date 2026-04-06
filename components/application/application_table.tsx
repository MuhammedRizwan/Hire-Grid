// components/Applications/ApplicationTable.tsx
import React, { useState } from 'react';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable, SortingState } from '@tanstack/react-table';
import { format } from 'date-fns';
import { MoreVertical, Edit, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu } from '@/components/ui/dropdown';
import { IJobApplication } from '@/types';
import { cn } from '@/lib/utils';

interface ApplicationTableProps {
  data: IJobApplication[];
  onEdit: (application: IJobApplication) => void;
  onDelete: (id: string) => void;
  onSendEmail: (application: IJobApplication) => void;
}

const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300',
  'follow-up': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-300',
  interview: 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300',
  offer: 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300',
};

const statusLabels: Record<string, string> = {
  applied: 'Applied',
  'follow-up': 'Follow-up',
  interview: 'Interview',
  rejected: 'Rejected',
  offer: 'Offer',
};

const columnHelper = createColumnHelper<IJobApplication>();

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  data,
  onEdit,
  onDelete,
  onSendEmail,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const columns = [
    columnHelper.accessor('companyName', {
      header: 'Company',
      cell: (info) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('hrEmail', {
      header: 'HR Email',
      cell: (info) => (
        <a href={`mailto:${info.getValue()}`} className="text-blue-600 hover:underline">
          {info.getValue()}
        </a>
      ),
    }),
    columnHelper.accessor('position', {
      header: 'Position',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        return (
          <Badge className={cn('font-medium', statusColors[status] || 'bg-gray-100 text-gray-800')}>
            {statusLabels[status] || status}
          </Badge>
        );
      },
    }),
    columnHelper.accessor('emailSent', {
      header: 'Email',
      cell: (info) => (
        <Badge variant={info.getValue() ? 'success' : 'secondary'}>
          {info.getValue() ? 'Sent' : 'Not Sent'}
        </Badge>
      ),
    }),
    columnHelper.accessor('resumeSent', {
      header: 'Resume',
      cell: (info) => (
        <Badge variant={info.getValue() ? 'success' : 'secondary'}>
          {info.getValue() ? 'Sent' : 'Not Sent'}
        </Badge>
      ),
    }),
    columnHelper.accessor('followUpDate', {
      header: 'Follow-up Date',
      cell: (info) => {
        const date = info.getValue();
        return date ? format(new Date(date), 'MMM dd, yyyy') : '-';
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onSendEmail(info.row.original)}
          >
            <Send className="w-4 h-4 mr-2" />
            Email
          </Button>

          <DropdownMenu
            trigger={
              <Button size="sm" variant="ghost">
                <MoreVertical className="w-4 h-4" />
              </Button>
            }
            items={[
              {
                label: 'Edit',
                icon: <Edit className="w-4 h-4" />,
                onClick: () => onEdit(info.row.original),
              },
              {
                label: 'Delete',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: () => onDelete(info.row.original._id),
                danger: true,
              },
            ]}
          />
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <input
          type="text"
          placeholder="Search by company, position, or email..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] || null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing{' '}
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{' '}
          of {data.length} results
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};