"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname, useRouter } from "next/navigation";
export function TabsDemo({ selectedTab }: { selectedTab: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleOnChange = (category: string) => {
    const params = new URLSearchParams();
    params.set("category", category);

    router.replace(`${pathname}?${params}`);
  };
  return (
    <Tabs
      defaultValue={selectedTab}
      value={selectedTab}
      className="w-100"
      onValueChange={handleOnChange}
    >
      <TabsList>
        <TabsTrigger value="all">Todas</TabsTrigger>
        <TabsTrigger value="available">Disponibles</TabsTrigger>
        <TabsTrigger value="sold">Vendidas</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              View your key metrics and recent project activity. Track progress
              across all your active projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 12 active projects and 3 pending tasks.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="available">
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Track performance and user engagement metrics. Monitor trends and
              identify growth opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Page views are up 25% compared to last month.
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="solds">
        <Card>
          <CardHeader>
            <CardTitle>Reports</CardTitle>
            <CardDescription>
              Generate and download your detailed reports. Export data in
              multiple formats for analysis.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            You have 5 reports ready and available to export.
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
