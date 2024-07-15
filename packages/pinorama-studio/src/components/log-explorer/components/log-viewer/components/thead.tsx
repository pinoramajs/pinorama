import { type Table, flexRender } from "@tanstack/react-table"

import clsx from "clsx"
import style from "./thead.module.css"

export function TableHead({ table }: { table: Table<unknown> }) {
  return (
    <thead className={clsx(style.head, "group")}>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              colSpan={header.colSpan}
              className={style.header}
              style={{ width: header.getSize() }}
            >
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
              {header.column.getCanResize() && (
                <div
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                  className={clsx(
                    style.headerContent,
                    header.column.getIsResizing() && style.resizing
                  )}
                />
              )}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  )
}
