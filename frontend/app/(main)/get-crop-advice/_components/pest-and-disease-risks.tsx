import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  pestsAndDiseaseRisks,
  preventiveMeasures,
} from "@/lib/constants/crop-recomendation";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import React from "react";

export const PestsAndDiseaseRisks = () => {
  return (
    <Card className=" bg-secondary">
      <CardHeader>
        <h2 className=" text-xl font-semibold">Pests and Disease Risks</h2>
      </CardHeader>
      <CardContent className="flex gap-2 ">
        <div className="flex flex-col gap-2 flex-grow">
          {pestsAndDiseaseRisks.map((risk) => (
            <Card key={risk.id} className="">
              <CardContent className=" mt-3 -mb-1">
                <div className="flex items-center gap-2">
                  {risk.type === "alert" ? (
                    <AlertTriangle
                      className={cn(" size-8  mr-2", risk.riskColor)}
                    />
                  ) : (
                    <CheckCircle2
                      className={cn(" size-8  mr-2", risk.riskColor)}
                    />
                  )}
                  <div>
                    <h3 className=" text- font-semibold">{risk.riskTitle}</h3>
                    <p className=" text-sm">{risk.riskDescription}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-grow flex-col gap-2 p-2 bg-indigo-50 border border-dotted border-indigo-300 rounded-md">
          <h3 className="text-lg font-semibold">Preventive Measures</h3>
          {preventiveMeasures.map((prevention) => (
            <ul key={prevention.id} className="flex flex-col gap-2">
              <li className="text-sm">- {prevention.prevention}</li>
            </ul>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
