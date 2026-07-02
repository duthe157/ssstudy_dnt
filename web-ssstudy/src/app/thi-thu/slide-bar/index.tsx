import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Input,
  Typography,
} from "@/components/ui";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import React, { useMemo } from "react";

import Search from "@/components/icons/Search";
import { useGetCityList } from "@/hooks/api/useGetCityList";
import { Select } from "antd";

type Props = {
  accordionItems: {
    title: string;
    content: JSX.Element;
  }[];
  expandedSections: Record<string, boolean>;
  search?: string;
  setSearch: (value: string) => void;
  handleClearFilter: () => void;
};
const SideBar = ({
  accordionItems,
  expandedSections,
  search,
  setSearch,
  handleClearFilter,
}: Props) => {
  const { data } = useGetCityList();

  const options = useMemo(
    () =>
      data?.map((item) => ({
        label: item.name,
        value: item.codename,
      })) ?? [],
    [data]
  );

  return (
    <div>
      {/* Adjusted width to w-1/4 for better content display */}
      {/* "Tốt nghiệp" section */}
      <Accordion type="multiple" className="w-full" defaultValue={["item-1"]}>
        {accordionItems.map((item, index) => (
          <AccordionItem
            key={`item-${index}`}
            value={`item-${index + 1}`}
            className="pb-4 mb-4 border-b border-foundation-50"
          >
            <AccordionTrigger
              className={cn(
                "p-2 [&>svg]:text-foundation-300 [&>p]:text-foundation-300",
                "[&[data-state=open]]:bg-blue-500 [&[data-state=open]>p]:text-white [&[data-state=open]>svg]:text-white"
              )}
            >
              <Typography variant={"sm16"} className="font-bold">
                {item.title}
              </Typography>
            </AccordionTrigger>
            <AccordionContent className="p-2 bg-foundation-50/20 flex flex-col gap-2">
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      {/* "Thành phố" section */}
      <div className="border-b border-foundation-50 pb-4 mb-4">
        <Typography
          variant={"sm16"}
          className="font-bold text-foundation-300 p-2"
        >
          Thành phố
        </Typography>
        <div className="flex flex-col w-full gap-2">
          {expandedSections["thanh-pho"] && (
            <Select
              options={options}
              showSearch
              value={search}
              onChange={(value) => {
                setSearch(value);
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              placeholder="Tìm kiếm thành phố"
              className={cn(
                "w-full",
                "[&>.ant-select-selector]:!bg-[#F1F5FA] [&>.ant-select-selector]:!px-3 [&>.ant-select-selector]:!rounded-full [&>.ant-select-selector]:!text-sm"
              )}
            />
          )}
        </div>
      </div>

      {/* "Xóa bộ lọc" button */}
      <div>
        <button
          className="text-blue-600 hover:underline"
          onClick={handleClearFilter}
        >
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
};

export default SideBar;
