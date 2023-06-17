import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { features } from "@/config/features";


export default function RoadmapPage () {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Roadmap for the Homey Community Space 🚀
        </h1>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, index) => (
              <TableRow key={index}>
                <TableHead><span title={
                  feature.done ? 'Finished' : (feature.doing ? 'In progress' : 'Planned')
                }>{feature.done ? '✅' : (feature.doing ? '🏃' : '🗓️')}</span></TableHead>
                <TableHead>{feature.feature}</TableHead>
                <TableHead>{feature.done ? 'Finished' : (feature.doing ? 'In progress' : 'Not started')}</TableHead>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
