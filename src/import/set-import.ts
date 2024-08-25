/*
WS-TCG:
Product page has Release Date on Detail Page and Set Type in the name (kinda, not consistent).
Cardlist has Type as grouping. The names seem to 100% match the ones from the product page (excluding the set type)
So we could check for product that includes the set name from card list.
We must also match set type, since some sets have the same name (RWBY booster vs. RWBY premium booster are both called RWBY).

We can also potentially get all cards from WS-TCG through this method.
We would have to develop a more involved scraper app though that goes through the pages in the set overview.

But we would get all foil cards, since they are included in the set overview.

If we import sets this way, we don't have the SHA that tells us if the set changed, which means we either don't recognize changes,
or we check all sets everytime.

Multiple Sets:
We would import TDs and BPs as separate sets maybe.
Problem: SetID conflicts. S31 would be for both the TD and BP.
We could have "S31_TD" for the ID, but then we need another column for the actual code maybe.

Some TDs are entirely different products. Bang Dream My Go!
Or the Hololive TDs have entirely different names for each gen.

*/