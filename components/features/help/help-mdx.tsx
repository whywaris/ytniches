import { TIER_INFO, TIERS } from "@/lib/billing/plans";
import { formatFact } from "@/lib/help/facts";
import { SUPPORT_EMAIL } from "@/lib/site";

// The components help articles may use (PRD.md §10.4): numbers only ever
// come through these, straight from the product's own constants.

function Fact({ k, unit }: { k: string; unit?: string }) {
  return <>{formatFact(k, unit)}</>;
}

function PlanTable() {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Plan</th>
          <th scope="col">Monthly</th>
          <th scope="col">Yearly</th>
          <th scope="col">Credits / month</th>
          <th scope="col">Tracked channels</th>
          <th scope="col">Channel sync</th>
        </tr>
      </thead>
      <tbody>
        {TIERS.map((tier) => (
          <tr key={tier}>
            <th scope="row">{TIER_INFO[tier].label}</th>
            <td>{formatFact(`plan.${tier}.monthlyPrice`)}</td>
            <td>{formatFact(`plan.${tier}.yearlyPrice`)}</td>
            <td>{formatFact(`plan.${tier}.credits`)}</td>
            <td>{formatFact(`plan.${tier}.channels`)}</td>
            <td>{formatFact(`plan.${tier}.sync`)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SupportLink() {
  return <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;
}

export const HELP_MDX_COMPONENTS = { Fact, PlanTable, SupportLink };
