"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/lib/firebase/client";
import type { ReceiptDisplay } from "@/types/receipt";

const columns: ColumnDef<ReceiptDisplay>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "merchant_name",
    header: "店舗名",
  },
  {
    accessorKey: "total_amount",
    header: "合計金額",
  },
  {
    accessorKey: "created_at",
    header: "作成日",
  },
];

export const ReceiptDataTable = () => {
  const [data, setData] = useState<ReceiptDisplay[]>([]);

  const getData = useCallback(async () => {
    try {
      const receiptsRef = collection(db, "receipts");
      const q = query(receiptsRef, orderBy("created_at", "desc"));
      const querySnapshot = await getDocs(q);

      const receipts: ReceiptDisplay[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        merchant_name: doc.data().merchant_name,
        total_amount: doc.data().total_amount,
        image_url: doc.data().image_url,
        created_at: doc.data().created_at.toDate().toISOString(),
      }));

      setData(receipts);
    } catch (error) {
      console.error("Firestore query error:", error);
      setData([]);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </th>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
