"use client";

import Icon from "../Icon/Icon";

export default function ChallengeRequirements() {
  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2 text-brand-secondary">
          <Icon name="Challenge" />
          <div className="font-medium font-mono">CHALLENGE</div>
        </div>
        <div className="text-primary font-medium text-2xl">
          Example Challenge Title
        </div>
      </div>
      <div className="custom-scrollbar max-h-[350px] overflow-y-scroll flex pr-2 sm:pr-10 pt-8 -mt-8 flex-col gap-y-12 pb-12 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_80%,transparent)]">
        <div className="flex flex-col gap-y-3">
          <span className="font-medium text-primary">Test 1 Requirement</span>
          <p className="text-secondary leading-[160%]">
            Lorem ipsum dolor sit amet consectetur. Justo turpis massa augue
            vitae leo imperdiet erat eu. Mattis nisl elit metus in mauris nibh
            mattis aliquet sem. Porttitor cursus massa velit suspendisse mattis
            sagittis mauris in. Neque leo tortor egestas sed urna massa tellus
            ac eget. Diam ullamcorper nulla et dui eu pulvinar. Vitae id
            pulvinar neque mauris mi felis amet quis vel. Felis lectus semper
            sit lacus odio id. Nec ultrices blandit adipiscing orci nunc justo
            in.
          </p>
        </div>

        <div className="flex flex-col gap-y-3">
          <span className="font-medium text-primary">Test 2 Requirement</span>
          <p className="text-secondary leading-[160%]">
            Lorem ipsum dolor sit amet consectetur. Justo turpis massa augue
            vitae leo imperdiet erat eu. Mattis nisl elit metus in mauris nibh
            mattis aliquet sem. Porttitor cursus massa velit suspendisse mattis
            sagittis mauris in. Neque leo tortor egestas sed urna massa tellus
            ac eget. Diam ullamcorper nulla et dui eu pulvinar. Vitae id
            pulvinar neque mauris mi felis amet quis vel. Felis lectus semper
            sit lacus odio id. Nec ultrices blandit adipiscing orci nunc justo
            in.
          </p>
        </div>

        <div className="flex flex-col gap-y-3">
          <span className="font-medium text-primary">Test 3 Requirement</span>
          <p className="text-secondary leading-[160%]">
            Lorem ipsum dolor sit amet consectetur. Justo turpis massa augue
            vitae leo imperdiet erat eu. Mattis nisl elit metus in mauris nibh
            mattis aliquet sem. Porttitor cursus massa velit suspendisse mattis
            sagittis mauris in. Neque leo tortor egestas sed urna massa tellus
            ac eget. Diam ullamcorper nulla et dui eu pulvinar. Vitae id
            pulvinar neque mauris mi felis amet quis vel. Felis lectus semper
            sit lacus odio id. Nec ultrices blandit adipiscing orci nunc justo
            in.
          </p>
        </div>
      </div>
    </div>
  );
}
