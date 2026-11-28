import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwitchRow } from "@/components/ui/switch";
import { Table, Th, Td, Tr } from "@/components/ui/table";

const routes = [
  { route: "/checkout", file: "src/pages/Checkout.tsx" },
  { route: "/cart", file: "src/pages/Cart.tsx" },
  { route: "/products/:id", file: "src/pages/ProductDetail.tsx" },
  { route: "/signup", file: "src/pages/Signup.tsx" },
];

export default function GithubPanel() {
  return (
    <>
      <div className="mb-4">
        <h2 className="font-display text-[19px] font-semibold">GitHub integration</h2>
        <p className="text-[12.5px] text-text-dim mt-0.5">
          Connected repository, route mapping, and automatic scan triggers
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>Connected repository</CardTitle>
          <div className="flex items-center gap-2 p-2 rounded-md bg-panel-raised border border-hairline mb-3.5">
            <span className="w-1.5 h-1.5 rounded-full bg-pass shadow-[0_0_0_3px_var(--color-pass-dim)]" />
            <div>
              <div className="font-mono text-[11px]">acme/storefront-web</div>
              <div className="text-[10px] text-text-dim">main branch · OAuth connected as @person-d</div>
            </div>
          </div>
          <SwitchRow label="Scan on every push" defaultChecked />
          <SwitchRow label="Scan on pull request open" defaultChecked />
          <SwitchRow label="Open PRs as draft, not ready-for-review" defaultChecked />
          <Button variant="ghost" size="sm" className="mt-3.5">
            Disconnect repository
          </Button>
        </Card>

        <Card>
          <CardTitle>Route → source mapping</CardTitle>
          <Table>
            <thead>
              <tr>
                <Th>Route</Th>
                <Th>Source file</Th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <Tr key={r.route} hover={false}>
                  <Td className="font-mono text-text-muted">{r.route}</Td>
                  <Td className="font-mono text-signal">{r.file}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
