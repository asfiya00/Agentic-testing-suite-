import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SwitchRow } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export default function Settings() {
  return (
    <>
      <div className="mb-4">
        <h2 className="font-display text-[19px] font-semibold">Settings</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardTitle>Account</CardTitle>
          <SwitchRow
            label="GitHub connection"
            desc="@person-d · acme/storefront-web"
            right={
              <Button variant="ghost" size="sm">
                Manage
              </Button>
            }
          />
          <SwitchRow
            label="Email notifications"
            desc="Critical bugs and failed verifications"
            defaultChecked
          />
          <SwitchRow
            label="LLM provider"
            desc="Google Gemini (Flash) · falls back to Groq"
            right={
              <Button variant="ghost" size="sm">
                Change
              </Button>
            }
          />
        </Card>

        <Card>
          <CardTitle>Agent guardrails</CardTitle>
          <SwitchRow label="Never submit real payment forms" defaultChecked />
          <SwitchRow label="Respect robots.txt" defaultChecked />
          <SwitchRow
            label="Rate limit: max requests per minute"
            right={<Input defaultValue="60" className="w-[60px] text-center" />}
          />
          <SwitchRow
            label="Patcher ↔ Verifier retry cap"
            right={<Input defaultValue="3" className="w-[60px] text-center" />}
          />
        </Card>
      </div>
    </>
  );
}
