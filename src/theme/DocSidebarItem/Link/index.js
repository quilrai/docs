import React from "react";
import clsx from "clsx";
import { ThemeClassNames } from "@docusaurus/theme-common";
import { isActiveSidebarItem } from "@docusaurus/plugin-content-docs/client";
import Link from "@docusaurus/Link";
import isInternalUrl from "@docusaurus/isInternalUrl";
import IconExternalLink from "@theme/Icon/ExternalLink";
import { productById } from "@site/src/data/products";

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
  // Links into another product (customProps.crossLink, injected by the
  // sidebarItemsGenerator) get a muted "<Product> ↗" hint.
  const crossProduct = productById[customProps?.crossLink];

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        "menu__list-item",
        { "qd-side-top": level === 1, "qd-crosslink": crossProduct },
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
        <span className="sidebar-link-label" title={label}>
          {label}
        </span>
        {crossProduct && (
          <span className="qd-xp">{crossProduct.name} ↗</span>
        )}
        {badge && (
          <span className="sidebar-badge sidebar-badge--new">{badge}</span>
        )}
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
