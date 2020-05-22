## Holidays 

==https://ncbs.res.in/hippo --> Login --> (top right) :fa-bars: --> Hippo Admin --> Holidays==

Thee are two kind of "holidays" in on this page:

1. The public holiday as notified by the Government (list is usually available
   here https://www.ncbs.res.in/holidays).
2. Special days on which public events such as AWS and/or talks are not
   allowed. Such days include Annual Talks, visits by ministers, etc.. These
   dates are not known in advance. It is recommended that when these  dates are
   known there are put into the system as holidays but with `is_public_holiday`
   field set to `NO`.

### Booking policy on public holidays

Hippo __does not__ allow following type of events on public holidays for which
`Allow AWS or Thesis Seminar` is set to `NO`.

1. Annual Work Seminar (AWS) (booking class `ANNUAL WORK SEMINAR`).
2. Thesis seminar (booking class `THESIS SEMINAR`).
3. Pre-synopsis Thesis Seminar (booking class `PRESYNOPSIS THESIS SEMINAR`).

All other public events are allowed but users are warned before booking.

!!! info "This policy is not implemented in legacy Hippo (https://ncbs.res.in/hippo/v1/welcome)"

### API

The api URL https://ncbs.res.in/hippo/v1/feed/holidays (accessible on intranet
as well as after login) retuns the list of holiday in JSON format.

If the field `is_public_holiday` is set to `YES` then it is a public holiday
else it is type 2 holiday. 

!!! note "Displaying holiday list using API data"
    While displaying public holidays using this API, filter using
    `is_public_holiday` key. 


## Faculty

On this page, you can add a new faculty, remove the old faculty or mark them
temporary `INACTIVE`. This list is used throughout the system. Make sure it is
up-to-date.
