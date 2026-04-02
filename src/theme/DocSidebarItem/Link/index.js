import React from "react";
import clsx from "clsx";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { isActiveSidebarItem } from "@docusaurus/plugin-content-docs/client";
import Link from "@docusaurus/Link";
import isInternalUrl from "@docusaurus/isInternalUrl";
import IconExternalLink from "@theme/Icon/ExternalLink";
import { getSidebarIcon } from "@site/src/utils/sidebarIcons";

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}) {
  const { href, label, className, autoAddBaseUrl, customProps } = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  const badge = customProps?.badge;
  const IconComponent = getSidebarIcon(customProps?.icon);

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        "menu__list-item",
        className,
      )}
      key={label}
    >
      <Link
        className={clsx("menu__link flex items-center gap-2", {
          "menu__link--active": isActive,
        })}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? "page" : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}
      >
        {IconComponent && (
          <IconComponent className="sidebar-icon" aria-hidden="true" />
        )}
        <span className="sidebar-link-label" title={label}>
          {label}
        </span>
        {badge && (
          <span className="sidebar-badge sidebar-badge--new">{badge}</span>
        )}
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
